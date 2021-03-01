import { describe, expect, test } from '@jest/globals';
import * as dynamodbUtils from '../index';

function makeid(length: Number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const testName = makeid(10);
console.log('test name: ', testName);

test('put and get same user', async () => {
  try {
    let data = await dynamodbUtils.putNewUser(testName);
    console.log(data);
  } catch (error) {
    console.error(error);
  }

  try {
    let user = await dynamodbUtils.getUser(testName);
    expect(user.name).toBe(testName);
  } catch (error) {
    console.error(error);
  }
});
