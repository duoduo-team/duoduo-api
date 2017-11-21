/**
 * Node.js API Starter Kit (https://reactstarter.com/nodejs)
 *
 * Copyright © 2016-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */
/* eslint-disable no-param-reassign, no-underscore-dangle, max-len */

import passport from 'passport';
import { Strategy as WechatStrategy } from 'passport-wechat';
import { Strategy as WeiboStrategy } from 'passport-weibo';
import { Strategy as QQStrategy } from 'passport-qq';
import { Strategy as LocalStrategy } from 'passport-local';

import db from './db';
import redis from './redis';

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    displayName: user.displayName,
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Creates or updates the external login credentials
// and returns the currently authenticated user.
async function login(req, provider, profile, tokens, done) {
  let user;

  if (req.user) {
    user = await db
      .table('users')
      .where({ id: req.user.id })
      .first();
  }

  if (!user) {
    user = await db
      .table('logins')
      .innerJoin('users', 'users.id', 'logins.userId')
      .where({ 'logins.provider': provider, 'logins.id': profile.id })
      .first('users.*');
  }
  if (!user) {
    const expiresIn = 10 * 60;
    const token = Math.random();
    await redis.setexAsync(
      `passport:${token}`,
      expiresIn,
      JSON.stringify({
        tokens,
        provider,
        profile,
      }),
    );
    done(null, false, { message: 'account not found.', token, expiresIn });
  } else {
    done(null, {
      id: user.id,
      displayName: user.displayName,
    });
  }
}

passport.use(
  new WechatStrategy(
    {
      appID: process.env.WECHAT_APPID,
      appSecret: process.env.WECHAT_SECRET,
      callbackURL: '/login/wechat/return',
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      try {
        login(
          req,
          'wechat',
          {
            id: profile.unionid || profile.openid,
            displayName: profile.nickname,
            username: profile.nickname,
          },
          {
            accessToken,
            refreshToken,
          },
          done,
        );
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.use(
  new WeiboStrategy(
    {
      clientID: process.env.WEIBO_APPID,
      clientSecret: process.env.WEIBO_SECRET,
      callbackURL: '/login/weibo/return',
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      try {
        login(
          req,
          'weibo',
          {
            id: profile.id,
            displayName: profile.displayName,
            username: profile.displayName,
          },
          {
            accessToken,
            refreshToken,
          },
          done,
        );
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.use(
  new QQStrategy(
    {
      clientID: process.env.QQ_APPID,
      clientSecret: process.env.QQ_SECRET,
      callbackURL: '/login/qq/return',
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, profile, done) => {
      try {
        login(
          req,
          'qq',
          {
            id: profile.id,
            displayName: profile.nickname,
            username: profile.nickname,
          },
          {
            accessToken,
            refreshToken,
          },
          done,
        );
      } catch (err) {
        done(err);
      }
    },
  ),
);

passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true,
    },
    (req, mobile, verifyCode, done) => {
      const token =
        (req.body && req.body.token) || (req.query && req.query.token);
      redis
        .getAsync(`passport:${token}`)
        .then(data => data && JSON.parse(data))
        .then(async info => {
          if (info && info.code === verifyCode) {
            let user = await db
              .table('mobiles')
              .where({ mobile, verified: true })
              .first();

            const { profile, tokens, provider } = info;
            if (!user) {
              // eslint-disable-next-line prefer-destructuring
              user = (await db
                .table('users')
                .insert({
                  displayName: profile.displayName,
                })
                .returning('*'))[0];

              await db.table('mobiles').insert({
                userId: user.id,
                mobile,
              });
            }

            const loginKeys = { userId: user.id, provider, id: profile.id };
            const { count } = await db
              .table('logins')
              .where(loginKeys)
              .count('id')
              .first();

            if (count === '0') {
              await db.table('logins').insert({
                ...loginKeys,
                username: profile.username,
                tokens: JSON.stringify(tokens),
                profile: JSON.stringify(profile._json),
              });
            } else {
              await db
                .table('logins')
                .where(loginKeys)
                .update({
                  username: profile.username,
                  tokens: JSON.stringify(tokens),
                  profile: JSON.stringify(profile._json),
                  updated_at: db.raw('CURRENT_TIMESTAMP'),
                });
            }
            done(null, {
              id: user.id,
              displayName: user.displayName,
            });
          } else {
            done(null, false, { message: 'Incorrect verify code.' });
          }
        });
    },
  ),
);

export default passport;
