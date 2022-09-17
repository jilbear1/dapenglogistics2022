const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class Batch extends Model {}


Batch.init(
    {
// general info
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        asn: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1
        },
//time data
        pending_date: {
           type: DataTypes.STRING,
           allowNull: false,
           defaultValue: new Date()
        },

//qty data
        total_box: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
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
      modelName: 'batch'
    }
  );

  module.exports = Batch;
