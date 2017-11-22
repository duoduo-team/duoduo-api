/**
 * @author lookis on 22/11/2017
 */

/* @flow */

import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from './Node';

export default new GraphQLObjectType({
  name: 'Mobile',
  interfaces: [nodeInterface],

  fields: {
    id: globalIdField(),

    mobile: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
