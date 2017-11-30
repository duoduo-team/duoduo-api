/* eslint-disable import/prefer-default-export */
/**
 * @author lookis on 22/11/2017
 */

/* @flow */

import { GraphQLNonNull, GraphQLString, GraphQLList } from 'graphql';
import { fromGlobalId } from 'graphql-relay';

import Context from '../Context';
import WordType from './WordType';

const words = {
  type: new GraphQLList(WordType),
  args: {
    categoryId: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve(root, args, { wordsByCategoryId }: Context) {
    const categoryId = fromGlobalId(args.categoryId).id;
    return wordsByCategoryId.load(categoryId);
  },
};

export { words };
