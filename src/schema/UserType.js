/**
 * Copyright © 2016-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */

import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';

import { nodeInterface } from './node';

export default new GraphQLObjectType({
  name: 'User',
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    displayName: {
      type: GraphQLString,
    },

    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parent.created_at;
      },
    },

    updatedAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve(parent) {
        return parent.updated_at;
      },
    },
  },
});
