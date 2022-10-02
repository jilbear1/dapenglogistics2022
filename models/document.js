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
        },// doc type: 0(detail image) 1(sku label image)
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0 //0 = admin, 1 = client
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
