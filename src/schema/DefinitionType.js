/**
 * @author lookis on 22/11/2017
 */

/* @flow */

import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './Node';

const DefinitionType = new GraphQLObjectType({
  name: 'Definition',
  interfaces: [nodeInterface],

  fields: () => ({
    id: globalIdField(),

    text: {
      type: GraphQLString,
    },

    part: {
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
  }),
});

export default DefinitionType;
