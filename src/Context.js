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

  categoryById = new DataLoader(keys =>
    db
      .table('categories')
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

  wordsByCategoryId = new DataLoader(keys =>
    db
      .table('words')
      .whereIn('categoryId', keys)
      .select()
      .then(rows => {
        rows.forEach(word => this.wordById.prime(word.id, word));
        return rows;
      })
      .then(mapToMany(keys, x => x.categoryId)),
  );

  phoneticSymbolsByWordId = new DataLoader(keys =>
    db
      .table('phoneticSymbols')
      .whereIn('wordId', keys)
      .select()
      .then(rows => {
        rows.forEach(symbol =>
          this.phoneticSymbolById.prime(symbol.id, symbol),
        );
        return rows;
      })
      .then(mapToMany(keys, x => x.wordId)),
  );

  examplesByWordId = new DataLoader(keys =>
    db
      .table('examples')
      .whereIn('wordId', keys)
      .select()
      .then(rows => {
        rows.forEach(example => this.exampleById.prime(example.id, example));
        return rows;
      })
      .then(mapToMany(keys, x => x.wordId)),
  );

  definitionsByWordId = new DataLoader(keys =>
    db
      .table('definitions')
      .whereIn('wordId', keys)
      .select()
      .then(rows => {
        rows.forEach(definition =>
          this.definitionById.prime(definition.id, definition),
        );
        return rows;
      })
      .then(mapToMany(keys, x => x.wordId)),
  );

  childrenCategoriesByParentId = new DataLoader(keys =>
    Promise.all(
      keys.map(key =>
        db
          .raw(
            'SELECT node.* ' +
              'FROM categories AS node, ' +
              '  categories AS parent, ' +
              '  categories AS sub_parent, ' +
              '  ( ' +
              '    SELECT node.id, (COUNT(parent.id) - 1) AS depth ' +
              '    FROM categories AS node, ' +
              '      categories AS parent ' +
              '    WHERE node.lft BETWEEN parent.lft AND parent.rgt ' +
              '      AND node.id = ? ' +
              '    GROUP BY node.id ' +
              '    ORDER BY node.lft ' +
              '  )AS sub_tree ' +
              'WHERE node.lft BETWEEN parent.lft AND parent.rgt ' +
              '  AND node.lft BETWEEN sub_parent.lft AND sub_parent.rgt ' +
              '  AND sub_parent.id = sub_tree.id ' +
              'GROUP BY node.id, sub_tree.depth ' +
              'HAVING (COUNT(parent.name) - (sub_tree.depth + 1)) = 1 ' +
              'ORDER BY node.lft; ',
            [key],
          )
          .then(result => {
            result.rows.forEach(category =>
              this.categoryById.prime(category.id, category),
            );
            return result;
          })
          .then(result => result.rows),
      ),
    ),
  );

  parentCategoryByChildId = new DataLoader(keys =>
    Promise.all(
      keys.map(key =>
        db
          .raw(
            'SELECT parent.*  ' +
              'FROM categories AS parent, ' +
              '  categories AS node ' +
              'WHERE node.lft > parent.lft AND node.rgt < parent.rgt ' +
              '  AND node.id = ? ' +
              'ORDER BY parent.lft ' +
              'DESC ' +
              'LIMIT 1; ',
            [key],
          )
          .then(result => {
            result.rows.forEach(category =>
              this.categoryById.prime(category.id, category),
            );
            return result;
          })
          .then(result => result.rows[0]),
      ),
    ),
  );

  /*
   * Authenticatinon and permissions.
   */

  ensureIsAuthenticated() {
    if (!this.user) throw new UnauthorizedError();
  }
}

export default Context;
