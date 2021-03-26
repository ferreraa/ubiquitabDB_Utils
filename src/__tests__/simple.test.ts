import { describe, expect, test } from '@jest/globals';
import * as dynamodbUtils from '../index';


require('dotenv').config();

if (typeof process.env.AKI === 'undefined' || typeof process.env.SAK === 'undefined') {
  console.error('AKI or SAK undefined as environment variable');
}

dynamodbUtils.config('Users_dev', {
  region: "eu-west-3",
  accessKeyId: process.env.AKI,
  secretAccessKey: process.env.SAK
})


function makeid(length: Number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const testPut = {
  testEMail: makeid(10) + '@google.com',
  testName: makeid(10),
  testHash: makeid(256),
  testSalt: makeid(20),  
}
console.log('test put: ', testPut);

test('put and get same user', async () => {
  try {
    let data = await dynamodbUtils.putNewUser(testPut.testEMail,
                                              testPut.testName,
                                              testPut.testHash,
                                              testPut.testSalt);
    console.log(data);
  } catch (error) {
    console.error(error);
  }

  try {
    let user = await dynamodbUtils.getUser(testPut.testEMail);
    expect(user.email).toBe(testPut.testEMail);
    expect(user.name).toBe(testPut.testName);
  } catch (error) {
    console.error(error);
  }
});
