/* eslint-disable import/prefer-default-export */
/**
 * @author lookis on 22/11/2017
 */
import { GraphQLString, GraphQLList } from 'graphql';
import { fromGlobalId } from 'graphql-relay';
import type Context from '../Context';
import db from '../db';

import CategoryType from './CategoryType';

const categoriesByParentId = {
  type: new GraphQLList(CategoryType),
  args: {
    parentId: { type: GraphQLString },
  },
  async resolve(root, args, { childrenCategoriesByParentId }: Context) {
    const parentId =
      typeof args.parentId === 'undefined'
        ? await db
            .table('categories')
            .where('lft', 1)
            .limit(1)
            .then(x => x[0].id)
        : fromGlobalId(args.parentId).id;
    return childrenCategoriesByParentId.load(parentId);
  },
};

export { categoriesByParentId };
