import AWS from 'aws-sdk';
import Chance from 'chance';
import moment from 'moment';

const chance = new Chance();

const db = process.env.IS_OFFLINE ?
  new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: `http://localhost:${process.env.DYNAMODB_PORT}`,
  }) :
  new AWS.DynamoDB.DocumentClient();

const getItems = userId =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    db.query(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ items: data.Items });
      }
    });
  });

const getItemById = (userId, itemId) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      Key: {
        id: { itemId },
        userId,
      },
    };

    db.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else if (!data.Item) {
        const notFoundError = new Error(`An item could not be found with id: ${itemId}`);

        notFoundError.responseStatusCode = 404;

        reject(notFoundError);
      } else {
        resolve(data.Item);
      }
    });
  });

const createItem = (userId, name) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      ConditionExpression: 'attribute_not_exists(id) AND attribute_not_exists(userId)',
      Item: {
        id: chance.guid(),
        userId,
        name,
        createdUtc: moment().utc().toISOString(),
      },
    };

    db.put(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(params.Item);
      }
    });
  });

const updateItem = (userId, itemId, name) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
      UpdateExpression: 'SET #name = :name',
      Key: {
        id: { itemId },
        userId,
      },
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': name,
      },
    };

    db.update(params, (err) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          const notFoundError = new Error(`An item could not be found with id: ${itemId}`);

          notFoundError.responseStatusCode = 404;

          reject(notFoundError);
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });

const deleteItem = (userId, itemId) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
      Key: {
        id: itemId,
        userId,
      },
    };

    db.delete(params, (err) => {
      if (err) {
        if (err.code === 'ConditionalCheckFailedException') {
          const notFoundError = new Error(`An item could not be found with id: ${itemId}`);

          notFoundError.responseStatusCode = 404;

          reject(notFoundError);
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });

export default { getItems, getItemById, createItem, updateItem, deleteItem };
