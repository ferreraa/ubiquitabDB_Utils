import { describe, expect, test } from '@jest/globals';
import * as dynamodbUtils from '../index';
import { User } from '../user';

require('dotenv').config();

if (typeof process.env.AKI === 'undefined' || typeof process.env.SAK === 'undefined') {
  console.error('AKI or SAK undefined as environment variable');
}

dynamodbUtils.config('Users_dev', {
  region: 'eu-west-3',
  accessKeyId: process.env.AKI,
  secretAccessKey: process.env.SAK,
});

function makeid(length: Number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function testUserGenerator() {
  return new User(makeid(20), makeid(10) + '@google.com', makeid(10), makeid(256), makeid(20));
}

test('put and get same user', async () => {
  const testUser = testUserGenerator();
  console.log('test put: ', testUser);
  try {
    let data = await dynamodbUtils.putNewUser(testUser);
  } catch (error) {
    throw new Error(error);
  }

  try {
    let user = await dynamodbUtils.getUser(testUser.email);
    expect(user.id).toBe(testUser.id);
    expect(user.email).toBe(testUser.email);
    expect(user.name).toBe(testUser.name);
    expect(user.hash).toBe(testUser.hash);
    expect(user.salt).toBe(testUser.salt);
  } catch (error) {
    throw new Error(error);
  }
});

test('get nonexistant user', async () => {
  let user = testUserGenerator();
  await dynamodbUtils.getUser(user.email).catch((e) => {
    expect(e).toEqual(new Error(`query over ${user.email} returned no Items`));
  });
});
