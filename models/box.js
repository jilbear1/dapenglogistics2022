const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class Box extends Model {}


Box.init(
    {
// general info
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        box_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cost: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },
        tracking: {
            type: DataTypes.STRING,
            allowNull: true
        },
        old_tracking: {
            type: DataTypes.STRING,
            allowNull: true
        },

//time data
        requested_date: {
            type: DataTypes.STRING,
            allowNull: true
         },
        received_date: {
            type: DataTypes.STRING,
            allowNull: true
         },
        shipped_date: {
            type: DataTypes.STRING,
            allowNull: true
         },
        bill_received: {
            type: DataTypes.BIGINT(14),
            allowNull: true
         },
         bill_storage: {
            type: DataTypes.BIGINT(14),
            allowNull: true
         },
        bill_shipped: {
            type: DataTypes.BIGINT(14),
            allowNull: true
         },
//qty data
        order: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "N/A"
        },
        qty_per_box: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true
        },
// dimension data
        length: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        width: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        height: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        weight: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        volume: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },

// distrubution data
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 1
        },
        file: {
            type: DataTypes.STRING,
            allowNull: true
        },
        file_2: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        s3: {
            type: DataTypes.STRING,
            allowNull: true
        },
        fba: {
            type: DataTypes.STRING,
            allowNull: true
        },
        custom_1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        custom_2: {
            type: DataTypes.STRING,
            allowNull: true
        },
        custom_3: {
            type: DataTypes.STRING,
            allowNull: true
        },
// forighn key data
        batch_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'batch',
            key: 'id'
           },
        },
        user_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'user',
            key: 'id'
           },
        },
        account_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'account',
              key: 'id'
             },
          }
    },
    {
      sequelize,
      freezeTableName: true,
      underscored: true,
      modelName: 'box'
    }
  );

  module.exports = Box;
