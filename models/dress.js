const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');


class dress extends Model {}


dress.init(
    {
// general info
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        Return_ID: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dress_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tracking_num: {
            type: DataTypes.STRING,
            allowNull: true
        },

//time data
        date_added: {
            type: DataTypes.STRING,
            allowNull: false
         },
//status data
        status: {
            type: DataTypes.STRING,
            allowNull: true
         },
        billed: {
            type: DataTypes.BIGINT,
            allowNull: true
         },
        searchitem: {
            type: DataTypes.STRING,
            allowNull: true
         },
// attributes data
        Condition: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT('tiny'),
            allowNull: true
        },
        volume: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cost: {
            type: DataTypes.STRING,
            allowNull: true
        },

// personal data
        First_Name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Last_Name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        City: {
            type: DataTypes.STRING,
            allowNull: true
        },
        State: {
            type: DataTypes.STRING,
            allowNull: true
        },
        Zip_Code: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
// foreign key data
        Client_Name: {
          type: DataTypes.STRING,
          references: {
            model: 'user',
            key: 'name'
           },
        },
        account: {
            type: DataTypes.STRING,
            references: {
              model: 'account',
              key: 'name'
             },
          },
        client_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'account',
              key: 'ID'
             },
          },
        account_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'user',
              key: 'ID'
             },
          },
    },
    {
      sequelize,
      freezeTableName: true,
      underscored: true,
      modelName: 'dress'
    }
  );

  module.exports = dress;
