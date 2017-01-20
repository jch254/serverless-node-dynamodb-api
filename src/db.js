import AWS from 'aws-sdk';
import Chance from 'chance';
import moment from 'moment';

const chance = new Chance();

const db = process.env.IS_OFFLINE ?
  new AWS.DynamoDB({
    region: 'localhost',
    endpoint: `http://localhost:${process.env.DYNAMODB_PORT}`,
  }) :
  new AWS.DynamoDB();

const mapDbItemToItem = item => (
  {
    id: item.id.S,
    name: item.name.S,
    createdUtc: item.createdUtc.S,
  }
);

const getItems = userId =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      IndexName: 'userId-index',
      KeyConditions: {
        userId: {
          AttributeValueList: [
            {
              S: userId,
            },
          ],
          ComparisonOperator: 'EQ',
        },
      },
    };

    db.query(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({ items: data.Items.map(mapDbItemToItem) });
      }
    });
  });

const getItemById = (userId, itemId) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      Key: {
        id: { S: itemId },
        userId: { S: userId },
      },
    };

    db.getItem(params, (err, data) => {
      if (err) {
        reject(err);
      } else if (!data.Item) {
        const notFoundError = new Error(`An item could not be found with id: ${itemId}`);

        notFoundError.responseStatusCode = 404;

        reject(notFoundError);
      } else {
        resolve(mapDbItemToItem(data.Item));
      }
    });
  });

const createItem = (userId, name) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      Item: {
        id: {
          S: chance.guid(),
        },
        userId: {
          S: userId,
        },
        name: {
          S: name,
        },
        createdUtc: {
          S: moment().utc().toISOString(),
        },
      },
      ConditionExpression: 'attribute_not_exists(id) AND attribute_not_exists(userId)',
    };

    db.putItem(params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(mapDbItemToItem(params.Item));
      }
    });
  });

const updateItem = (userId, itemId, name) =>
  new Promise((resolve, reject) => {
    const params = {
      TableName: 'items',
      Key: {
        id: { S: itemId },
        userId: { S: userId },
      },
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': {
          S: name,
        },
      },
      ReturnValues: 'NONE',
      ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
      UpdateExpression: 'SET #name = :name',
    };

    db.updateItem(params, (err) => {
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
      Key: {
        id: { S: itemId },
        userId: { S: userId },
      },
      ConditionExpression: 'attribute_exists(id) AND attribute_exists(userId)',
    };

    db.deleteItem(params, (err) => {
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
