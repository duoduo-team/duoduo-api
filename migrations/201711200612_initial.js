module.exports.up = async (db) => {
  // User accounts
  await db.schema.createTable('users', table => {
    // UUID v1mc reduces the negative side effect of using random primary keys
    // with respect to keyspace fragmentation on disk for the tables because it's time based
    // https://www.postgresql.org/docs/current/static/uuid-ossp.html
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.string('displayName', 100);
    table.string('passwordHash', 128);
    table.timestamps(false, true);
  });

  // Users' mobile number
  await db.schema.createTable('mobiles', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('mobile', 100).notNullable();
    table.timestamps(false, true);
    table.unique(['userId', 'mobile']);
  });

  // External logins with security tokens (e.g. Wechat, Weibo, QQ)
  await db.schema.createTable('logins', table => {
    table.uuid('userId').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('provider', 16).notNullable();
    table.string('id', 256).notNullable();
    table.string('username', 100);
    table.jsonb('tokens').notNullable();
    table.jsonb('profile').notNullable();
    table.timestamps(false, true);
    table.primary(['provider', 'id']);
  });

  // Category for words, include book, unit, etc.
  await db.schema.createTable('categories', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.string('name', 512).notNullable();
    table.integer('lft');
    table.integer('rgt');
    table.timestamps(false, true);
  });

  // Words
  await db.schema.createTable('words', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.uuid('categoryId').notNullable().references('id').inTable('categories').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('text', 128).notNullable();
    table.timestamps(false, true);
  });

  // Phonetic Symbols
  await db.schema.createTable('phoneticSymbols', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.uuid('wordId').notNullable().references('id').inTable('words').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('text', 256).notNullable();
    table.string('category', 256).notNullable();
    table.string('pronunciation', 2048).notNullable();
    table.timestamps(false, true);
  });

  // Example for words
  await db.schema.createTable('examples', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.uuid('wordId').notNullable().references('id').inTable('words').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('text', 8192).notNullable();
    table.timestamps(false, true);
  });

  // Definitions for words
  await db.schema.createTable('definitions', table => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.uuid('wordId').notNullable().references('id').inTable('words').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('part', 16).notNullable();
    table.string('text', 512).notNullable();
    table.timestamps(false, true);
  });
};

module.exports.down = async (db) => {
  await db.schema.dropTableIfExists('definitions');
  await db.schema.dropTableIfExists('examples');
  await db.schema.dropTableIfExists('phoneticSymbols');
  await db.schema.dropTableIfExists('words');
  await db.schema.dropTableIfExists('categories');
  await db.schema.dropTableIfExists('logins');
  await db.schema.dropTableIfExists('mobiles');
  await db.schema.dropTableIfExists('users');
};

module.exports.configuration = { transaction: true };
