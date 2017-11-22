/**
 * @author lookis on 22/11/2017
 */

/* @flow */

import { GraphQLNonNull, GraphQLInt } from 'graphql';
import {
  connectionDefinitions,
  forwardConnectionArgs,
  connectionFromArraySlice,
  cursorToOffset,
} from 'graphql-relay';

import db from '../db';
import WordType from './WordType';

const words = {
  type: connectionDefinitions({
    name: 'Word',
    nodeType: WordType,
    connectionFields: {
      totalCount: { type: new GraphQLNonNull(GraphQLInt) },
    },
  }).connectionType,
  args: forwardConnectionArgs,
  async resolve(root, args, { wordById }) {
    const limit = typeof args.first === 'undefined' ? '10' : args.first;
    const offset = args.after ? cursorToOffset(args.after) + 1 : 0;

    const [data, totalCount] = await Promise.all([
      db
        .table('words')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset)
        .then(rows => {
          rows.forEach(x => wordById.prime(x.id, x));
          return rows;
        }),
      db
        .table('words')
        .count()
        .then(x => x[0].count),
    ]);

    return {
      ...connectionFromArraySlice(data, args, {
        sliceStart: offset,
        arrayLength: totalCount,
      }),
      totalCount,
    };
  },
};

export default words;
