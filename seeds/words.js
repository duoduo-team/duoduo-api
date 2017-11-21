/* eslint-disable no-restricted-syntax, no-await-in-loop */

const faker = require('faker');

module.exports.seed = async db => {
  // Create 500 nested categories
  const categories = [
    {
      name: faker.lorem.sentence(),
      lft: 1,
      rgt: 2,
    },
  ];

  function addCategory(parent, options) {
    const newCategory = Object.assign({}, options);
    newCategory.lft = parent.lft + 1;
    newCategory.rgt = parent.lft + 2;
    for (let i = 0; i < categories.length; i += 1) {
      const category = categories[i];
      if (category.rgt > parent.lft) {
        category.rgt += 2;
      }
      if (category.lft > parent.lft) {
        category.lft += 2;
      }
    }
    return newCategory;
  }

  const level1CountPerCategory = 10;
  const level2CountPerCategory = 10;
  const level3CountPerCategory = 10;

  // add level 1 category
  let { length } = categories;
  for (let i = 0; i < length; i += 1) {
    for (let j = 0; j < level1CountPerCategory; j += 1) {
      categories.push(
        addCategory(categories[0], {
          name: faker.lorem.sentence(),
        }),
      );
    }
  }

  // add level 2 category
  length *= level1CountPerCategory;
  for (let i = 1; i < length; i += 1) {
    for (let j = 0; j < level2CountPerCategory; j += 1) {
      categories.push(
        addCategory(categories[i], {
          name: faker.lorem.sentence(),
        }),
      );
    }
  }

  // add level 3 category
  length = (length - 1) * level2CountPerCategory;
  for (let i = 1 + level1CountPerCategory; i < length; i += 1) {
    for (let j = 0; j < level3CountPerCategory; j += 1) {
      categories.push(
        addCategory(categories[i], {
          name: faker.lorem.sentence(),
        }),
      );
    }
  }

  await Promise.all(
    categories.map(category =>
      db
        .table('categories')
        .insert(category)
        .returning('id')
        .then(rows =>
          db
            .table('categories')
            .where('id', '=', rows[0])
            .first()
            .then(c => Object.assign(category, c)),
        ),
    ),
  );

  for (let i = 0; i < categories.length; i += 1) {
    const category = categories[i];
    if (category.rgt === category.lft + 1) {
      await Promise.all(
        faker.lorem
          .words(10)
          .split(' ')
          .map(word =>
            db
              .table('words')
              .insert({
                categoryId: category.id,
                word,
              })
              .returning('id')
              .then(rows => rows[0])
              .then(wordId =>
                db
                  .table('definitions')
                  .insert({
                    wordId,
                    part: faker.lorem.word(),
                    definition: faker.lorem.word(),
                  })
                  .then(() =>
                    db.table('phoneticSymbols').insert({
                      wordId,
                      symbol: faker.lorem.word(),
                      category: faker.lorem.word(),
                      pronunciation: faker.lorem.word(),
                    }),
                  )
                  .then(() =>
                    db.table('examples').insert({
                      wordId,
                      example: faker.lorem.sentence(),
                    }),
                  ),
              ),
          ),
      );
    }
  }
};
