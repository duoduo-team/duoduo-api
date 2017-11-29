/* eslint-disable no-use-before-define */
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
import type Context from '../Context';

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
      resolve(parent, args, { parentCategoryByChildId }: Context) {
        return (
          parent.parent_id && parentCategoryByChildId.load(parent.parent_id)
        );
      },
    },

    children: {
      type: new GraphQLList(CategoryType),
      resolve(parent, args, { childrenCategoriesByParentId }: Context) {
        return (
          parent.parent_id &&
          childrenCategoriesByParentId.load(parent.parent_id)
        );
      },
    },
  },
});

export default CategoryType;
