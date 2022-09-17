const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class Item extends Model {}


Item.init(
    {
// general info
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        item_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
//qty data
        qty_per_sku: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
// distrubution data
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
        container_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'container',
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
      modelName: 'item'
    }
  );

  module.exports = Item;
