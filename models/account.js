const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class Account extends Model {}


Account.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prefix: {
          type: DataTypes.STRING,
          allowNull: false
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
        user_id: {
          type: DataTypes.INTEGER,
          references: {
          model: 'user',
          key: 'id'
        },
      }
    },
    {
      sequelize,
      freezeTableName: true,
      underscored: true,
      modelName: 'account'
    }
  );

  module.exports = Account;
