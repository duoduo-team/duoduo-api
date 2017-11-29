/* eslint-disable import/prefer-default-export */
/**
 * @author lookis on 22/11/2017
 */

import CategoryType from './CategoryType';

export const category = {
  type: CategoryType,
  resolve(root, args, { user, userById }) {
    return user && userById.load(user.id);
  },
};
