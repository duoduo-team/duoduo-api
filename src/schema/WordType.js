/**
 * @author lookis on 22/11/2017
 */

/* @flow */

import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
} from 'graphql';
import { globalIdField } from 'graphql-relay';

import PhoneticSymbolType from './PhoneticSymbolType';
import DefinitionType from './DefinitionType';
import ExampleType from './ExampleType';
import { nodeInterface } from './Node';

const WordType = new GraphQLObjectType({
  name: 'Word',
  interfaces: [nodeInterface],

  fields: () => ({
    id: globalIdField(),

    text: {
      type: GraphQLString,
    },

    phoneticSymbols: {
      type: new GraphQLList(PhoneticSymbolType),
      resolve(parent, args, { phoneticSymbolsByWordId }) {
        return phoneticSymbolsByWordId.load(parent.id);
      },
    },

    examples: {
      type: new GraphQLList(ExampleType),
      resolve(parent, args, { examplesByWordId }) {
        return examplesByWordId.load(parent.id);
      },
    },

    definitions: {
      type: new GraphQLList(DefinitionType),
      resolve(parent, args, { definitionsByWordId }) {
        return definitionsByWordId.load(parent.id);
      },
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

export default WordType;
