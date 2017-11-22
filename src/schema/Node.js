/**
 * Node.js API Starter Kit (https://reactstarter.com/nodejs)
 *
 * Copyright © 2016-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */
/* eslint-disable global-require */

import { nodeDefinitions, fromGlobalId } from 'graphql-relay';
import { assignType, getType } from '../utils';

const { nodeInterface, nodeField: node, nodesField: nodes } = nodeDefinitions(
  (globalId, context) => {
    const { type, id } = fromGlobalId(globalId);

    switch (type) {
      case 'User':
        return context.userById.load(id).then(assignType('User'));
      case 'Mobile':
        return context.mobileById.load(id).then(assignType('Mobile'));
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
      case 'User':
        return require('./UserType').default;
      case 'Mobile':
        return require('./MobileType').default;
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

export { nodeInterface, node, nodes };
