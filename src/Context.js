/**
 * Node.js API Starter Kit (https://reactstarter.com/nodejs)
 *
 * Copyright © 2016-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */

import DataLoader from 'dataloader';
import type { request as Request } from 'express';
import type { t as Translator } from 'i18next';

import db from './db';
import { mapTo, mapToMany } from './utils';
import { UnauthorizedError } from './errors';

class Context {
  request: Request;
  user: any;
  t: Translator;

  constructor(request: Request) {
    this.request = request;
    this.user = request.user;
    this.t = request.t;
  }

  /*
   * Data loaders to be used with GraphQL resolve() functions. For example:
   *
   *   resolve(post: any, args: any, { userById }: Context) {
   *     return userById.load(post.author_id);
   *   }
   *
   * For more information visit https://github.com/facebook/dataloader
   */

  userById = new DataLoader(keys =>
    db
      .table('users')
      .whereIn('id', keys)
      .select()
      .then(mapTo(keys, x => x.id)),
  );

  mobileById = new DataLoader(keys =>
    db
      .table('mobiles')
      .whereIn('id', keys)
      .select()
      .then(mapTo(keys, x => x.id)),
  );

  wordById = new DataLoader(keys =>
    db
      .table('words')
      .whereIn('id', keys)
      .select()
      .then(mapTo(keys, x => x.id)),
  );

  phoneticSymbolById = new DataLoader(keys =>
    db
      .table('phoneticSymbols')
      .whereIn('id', keys)
      .select()
      .then(mapTo(keys, x => x.id)),
  );

  exampleById = new DataLoader(keys =>
    db
      .table('examples')
      .whereIn('id', keys)
      .select()
      .then(mapTo(keys, x => x.id)),
  );

  definitionById = new DataLoader(keys =>
    db
      .table('definitions')
      .whereIn('id', keys)
      .select()
      .then(mapTo(keys, x => x.id)),
  );

  mobileByUserId = new DataLoader(keys =>
    db
      .table('mobiles')
      .whereIn('userId', keys)
      .select()
      .then(mapTo(keys, x => x.userId)),
  );

  phoneticSymbolsByWordId = new DataLoader(keys =>
    db
      .table('phoneticSymbols')
      .whereIn('wordId', keys)
      .select()
      .then(mapToMany(keys, x => x.wordId)),
  );

  examplesByWordId = new DataLoader(keys =>
    db
      .table('examples')
      .whereIn('wordId', keys)
      .select()
      .then(mapToMany(keys, x => x.wordId)),
  );

  definitionsByWordId = new DataLoader(keys =>
    db
      .table('definitions')
      .whereIn('wordId', keys)
      .select()
      .then(mapToMany(keys, x => x.wordId)),
  );

  childrenCategoriesByParentId = new DataLoader(keys => {
    keys.map(key =>
      db
        .raw(
          ```
        SELECT node.*
        FROM categories AS node,
          categories AS parent,
          categories AS sub_parent,
          (
            SELECT node.id, (COUNT(parent.id) - 1) AS depth
            FROM categories AS node,
              categories AS parent
            WHERE node.lft BETWEEN parent.lft AND parent.rgt
              AND node.id = ?
            GROUP BY node.id
            ORDER BY node.lft
          )AS sub_tree
        WHERE node.lft BETWEEN parent.lft AND parent.rgt
          AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt
          AND sub_parent.id = sub_tree.id
        GROUP BY node.id, sub_tree.depth
        HAVING (COUNT(parent.name) - (sub_tree.depth + 1)) = 1
        ORDER BY node.lft;
        ```,
          [key],
        )
        .then(rows => ({
          rows,
        })),
    );
  });

  // parentCategoryBychildId;
  // wordsByCategoryId;

  /*
   * Authenticatinon and permissions.
   */

  ensureIsAuthenticated() {
    if (!this.user) throw new UnauthorizedError();
  }
}

export default Context;
