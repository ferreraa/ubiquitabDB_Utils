// installed modules
import * as AWS from 'aws-sdk';
import { GetItemInput, PutItemInput } from 'aws-sdk/clients/dynamodb';
import { APIVersions } from 'aws-sdk/lib/config';
import { ConfigurationServicePlaceholders } from 'aws-sdk/lib/config_service_placeholders';
const attr = require('dynamodb-data-types').AttributeValue;

// my modules
import { User } from './user';

let usersTable: string;

let dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

/**
 * configures the DynamoDB connection
 * @param usersTableName name of the table referring to the users
 * @param options OPTIONAL - config for AWS.config.update.
 */
export function config(usersTableName: string, options?:AWS.ConfigurationOptions & ConfigurationServicePlaceholders & APIVersions) {
  usersTable = usersTableName;

  if(typeof options !== 'undefined') {
    AWS.config.update(options);
    dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  }
}

/**
 * @param name unique name of the user
 * @returns Promise resolving in the corresponding User or null if none exist
 */
export function getUser(name: string): Promise<User> {
  const params: GetItemInput = {
    Key: {
      id: {
        S: name,
      },
    },
    TableName: usersTable,
    ConsistentRead: true,
  };

  return new Promise((resolve, reject) => {
    dynamodb.getItem(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      if (Object.keys(data).length !== 0) {
        const res = attr.unwrap(data.Item);
        const user = new User(res.id);
        resolve(user);
      } else {
        reject(new Error(`user ${name} doesn't exist`));
      }
    });
  });
}

/**
 *
 * @param name name of the new user. This name must be unique in the database
 */
export function putNewUser(name: string): Promise<any> {
  const dynamoItem = attr.wrap({ id: name });

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