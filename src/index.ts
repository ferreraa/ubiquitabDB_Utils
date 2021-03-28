// installed modules
import * as AWS from 'aws-sdk';
import { PutItemInput, QueryInput } from 'aws-sdk/clients/dynamodb';
import { APIVersions } from 'aws-sdk/lib/config';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
const attr = require('dynamodb-data-types').AttributeValue;

// my modules
import { User } from './user';
export { User };

let usersTable: string;

let dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

/**
 * configures the DynamoDB connection
 * @param usersTableName name of the table referring to the users
 * @param options OPTIONAL - config for AWS.config.update.
 */
export function config(
  usersTableName: string,
  options?: AWS.ConfigurationOptions & ConfigurationServicePlaceholders & APIVersions,
) {
  usersTable = usersTableName;

  if (typeof options !== 'undefined') {
    AWS.config.update(options);
    dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  }
}

/**
 * @param email unique email of the user
 * @returns Promise resolving in the corresponding User or null if none exist
 */
export function getUser(email: string): Promise<User> {
  const params: QueryInput = {
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    TableName: usersTable,
  };

  return new Promise((resolve, reject) => {
    dynamodb.query(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      if (typeof data.Items === 'undefined' || data.Items.length === 0) {
        reject(new Error(`query over ${email} returned no Items`));
        return;
      }

      const res = attr.unwrap(data.Items[0]);
      const user = new User(res.id, res.email, res.name, res.hash, res.salt);
      resolve(user);
    });
  });
}

/**
 * @param user user to be pushed to the database
 * @returns promise from dynamodb.putItem resolving in PutItemOutput or rejecting in AWSError
 */
export function putNewUser(user: User): Promise<any> {
  const dynamoItem = attr.wrap({
    id: user.id,
    email: user.email,
    name: user.name,
    hash: user.hash,
    salt: user.salt,
  });

  const params: PutItemInput = {
    Item: dynamoItem,
    TableName: usersTable,
  };

  return new Promise((resolve, reject) => {
    dynamodb.putItem(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}
