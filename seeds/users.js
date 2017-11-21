/* eslint-disable no-restricted-syntax, no-await-in-loop */

const faker = require('faker');

module.exports.seed = async db => {
  // Create 10 random website users (as an example)
  const users = Array.from({ length: 10 }).map(() => ({
    displayName: faker.name.findName(),
  }));

  await Promise.all(
    users.map(user =>
      db
        .table('users')
        .insert(user)
        .returning('id')
        .then(rows =>
          db
            .table('users')
            .where('id', '=', rows[0])
            .first()
            .then(u =>
              db
                .table('mobiles')
                .insert({
                  userId: u.id,
                  mobile: faker.phone.phoneNumber(),
                })
                .then(() => u),
            ),
        )
        .then(row => Object.assign(user, row)),
    ),
  );
};
