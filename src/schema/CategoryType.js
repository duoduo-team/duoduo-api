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

  fields: () => ({
    id: globalIdField(),

    name: {
      type: new GraphQLNonNull(GraphQLString),
    },

    parent: {
      type: CategoryType,
      resolve(parent, args, { parentCategoryByChildId }: Context) {
        return parentCategoryByChildId.load(parent.id);
      },
    },

    children: {
      type: new GraphQLList(CategoryType),
      resolve(parent, args, { childrenCategoriesByParentId }: Context) {
        return childrenCategoriesByParentId.load(parent.id);
      },
    },
  }),
});

export default CategoryType;
