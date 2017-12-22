/**
 * Copyright © 2016-present Kriasoft.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */
/* eslint-disable global-require */

import { nodeDefinitions, fromGlobalId } from 'graphql-relay';

import { assignType, getType } from '../utils';

export const { nodeInterface, nodeField, nodesField } = nodeDefinitions(
  (globalId, context) => {
    const { type, id } = fromGlobalId(globalId);

    switch (type) {
      case 'Category':
        return context.categoryById.load(id).then(assignType('Category'));
      case 'User':
        return context.userById.load(id).then(assignType('User'));
      case 'Word':
        return context.wordById.load(id).then(assignType('Word'));
      case 'Definition':
        return context.definitionById.load(id).then(assignType('Definition'));
      case 'Example':
        return context.exampleById.load(id).then(assignType('Example'));
      case 'PhoneticSymbol':
        return context.phoneticSymbolById
          .load(id)
          .then(assignType('PhoneticSymbol'));
      default:
        return null;
    }
  },
  obj => {
    switch (getType(obj)) {
      case 'Category':
        return require('./CategoryType').default;
      case 'User':
        return require('./UserType').default;
      case 'Word':
        return require('./WordType').default;
      case 'Definition':
        return require('./DefinitionType').default;
      case 'Example':
        return require('./ExampleType').default;
      case 'PhoneticSymbol':
        return require('./PhoneticSymbolType').default;
      default:
        return null;
    }
  },
);
