const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class Container extends Model {}


Container.init(
    {
// general info
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        container_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tracking: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
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
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
// dimension data
        length: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },
        width: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },
        height: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },
        weight: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },
        volume: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },
        cost: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: true
        },

// distrubution data
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
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
        fba: {
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
        qty_of_fee: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        unit_fee: {
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
      modelName: 'container'
    }
  );

  module.exports = Container;
