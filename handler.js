import Chance from 'chance';
import moment from 'moment';
import AWS from 'aws-sdk';

const chance = new Chance();

const db = process.env.NODE_ENV === 'production' ?
  new AWS.DynamoDB() :
  new AWS.DynamoDB({
    region: 'localhost',
    endpoint: `http://localhost:${process.env.DYNAMODB_PORT}`,
  });

const mapItem = item => (
  {
    id: item.id.S,
    name: item.name.S,
    createdUtc: item.createdUtc.S,
  }
);

const mapData = data => (
  {
    id: data.Attributes.id.S,
    name: data.Attributes.name.S,
  }
);

const createResponse = (statusCode, body) => (
  {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify(body),
  }
);

export const getItems = (event, context, callback) => {
  console.log('getItems', JSON.stringify(event));

  const params = {
    TableName: 'items',
  };

  try {
    db.scan(params, (err, data) => {
      if (err) {
        callback(createResponse(500, { message: err.message || 'Internal server error' }));
      } else {
        callback(null, createResponse(200, { items: data.Items.map(mapItem) }));
      }
    });
  } catch (err) {
    callback(createResponse(500, { message: err.message || 'Internal server error' }));
  }
};

export const getItem = (event, context, callback) => {
  console.log('getItem', JSON.stringify(event));

  const params = {
    TableName: 'items',
    Key: {
      id: { S: event.path.id },
    },
  };

  try {
    db.getItem(params, (err, data) => {
      if (err) {
        callback(createResponse(500, { message: err.message || 'Internal server error' }));
      } else {
        callback(null, createResponse(200, mapItem(data.Item)));
      }
    });
  } catch (err) {
    callback(createResponse(500, { message: err.message || 'Internal server error' }));
  }
};

export const createItem = (event, context, callback) => {
  console.log('createItem', JSON.stringify(event));

  const params = {
    Item: {
      id: {
        S: chance.guid(),
      },
      name: {
        S: event.body.name,
      },
      createdUtc: {
        S: moment().utc().toISOString(),
      },
    },
    TableName: 'items',
    ConditionExpression: 'attribute_not_exists(id)',
  };

  try {
    db.putItem(params, (err) => {
      if (err) {
        callback(createResponse(500, { message: err.message || 'Internal server error' }));
      } else {
        callback(null, createResponse(200, mapItem(params.Item)));
      }
    });
  } catch (err) {
    callback(createResponse(500, { message: err.message || 'Internal server error' }));
  }
};

export const updateItem = (event, context, callback) => {
  console.log('updateItem', JSON.stringify(event));

  const params = {
    TableName: 'items',
    Key: {
      id: { S: event.path.id },
    },
    AttributeUpdates: {
      name: {
        Action: 'PUT',
        Value: { S: event.body.name },
      },
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    db.updateItem(params, (err, data) => {
      if (err) {
        callback(createResponse(500, { message: err.message || 'Internal server error' }));
      } else {
        callback(null, createResponse(200, mapData(data)));
      }
    });
  } catch (err) {
    callback(createResponse(500, { message: err.message || 'Internal server error' }));
  }
};

export const deleteItem = (event, context, callback) => {
  console.log('deleteItem', JSON.stringify(event));

  const params = {
    TableName: 'items',
    Key: {
      id: { S: event.path.id },
    },
  };

  try {
    db.deleteItem(params, (err) => {
      if (err) {
        callback(createResponse(500, { message: err.message || 'Internal server error' }));
      } else {
        callback(null, createResponse(200));
      }
    });
  } catch (err) {
    callback(createResponse(500, { message: err.message || 'Internal server error' }));
  }
};
