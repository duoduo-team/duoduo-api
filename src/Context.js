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

  // childrenCategoriesByParentId;
  // parentCategoryByChildId;

  /*
   * Authenticatinon and permissions.
   */

  ensureIsAuthenticated() {
    if (!this.user) throw new UnauthorizedError();
  }
}

export default Context;
