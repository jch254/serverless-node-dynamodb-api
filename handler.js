import Chance from 'chance';
import moment from 'moment';
import AWS from 'aws-sdk';

// TODO: Get region from Serverless variable
AWS.config.update({ region: 'ap-southeast-2' });

const chance = new Chance();
const db = new AWS.DynamoDB();

const mapItem = (item) => (
  {
    "id": item.id.S,
    "name": item.name.S,
    "createdUtc": item.createdUtc.S
  }
);

export const createItem = (event, context, cb) => {
  console.log("createItem", JSON.stringify(event));

  const id = chance.guid();

  const params = {
    "Item": {
      "id": {
        "S": id
      },
      "name": {
        "S": event.body.name
      },
      "createdUtc": {
        "S": moment().utc().toISOString()
      }
    },
    "TableName": "items",
    "ConditionExpression": "attribute_not_exists(id)"
  };

  db.putItem(params, (err, data) => {
    if (err) {
      cb(err);
    } else {
      cb(null, mapItem(params.Item));
    }
  });
};

export const getItems = (event, context, cb) => {
  console.log("getItems", JSON.stringify(event));

  const params = {
    "TableName": "items"
  };

  db.scan(params, function(err, data) {
    if (err) {
      cb(err);
    } else {
      const res = {
        "items": data.Items.map(mapItem)
      };

      cb(null, res);
    }
  });
};
