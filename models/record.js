const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
class Record extends Model {}
Record.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        ref_number: {
            type: DataTypes.STRING,
            allowNull: true
        },//box_numbers, container_numbers, and item_numbers
        sub_number: {
            type: DataTypes.STRING,
            allowNull: true
        },//for container_number when ref number is item_number
        status_from: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status_to: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        qty_from: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        qty_to: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        action: {
            type: DataTypes.STRING,
            allowNull: true
        },
        action_notes: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        bill: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        date: {
            type: DataTypes.DATEONLY,
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
      modelName: 'record'
    }
);module.exports = Record;
