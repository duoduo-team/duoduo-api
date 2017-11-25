/**
 * @author lookis on 22/11/2017
 */

/* @flow */

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
} from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './Node';

import WordType from './WordType';

const CategoryType = new GraphQLObjectType({
  name: 'Category',
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    name: {
      type: new GraphQLNonNull(GraphQLString),
    },

    parent: {
      type: CategoryType,
      resolve(parent, args, { commentById }) {
        // return parent.parent_id && commentById.load(parent.parent_id);
      },
    },

    children: {
      type: new GraphQLList(CategoryType),
      resolve(parent, args, { commentById }) {
        // return parent.parent_id && commentById.load(parent.parent_id);
      },
    },

    words: {
      type: new GraphQLList(WordType),
      resolve(parent, args, {}) {},
    },
  },
});

export default CategoryType;
