const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class Document extends Model {}


Document.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },// doc type: 0(general) 1(tracking) 2(supplmental)
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        tracking: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        message: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        references: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        date: {
            type: DataTypes.STRING,
            allowNull: true
        },
        file: {
            type: DataTypes.STRING,
            allowNull: true
        },
        file_2: {
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
      modelName: 'document'
    }
  );

  module.exports = Document;
