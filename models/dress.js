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
        return_num: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dress_num: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tracking_num: {
            type: DataTypes.STRING,
            allowNull: true
        },
        dress_sku: {
            type: DataTypes.STRING,
            allowNull: true
        },
        return_sku: {
            type: DataTypes.STRING,
            allowNull: true
        },
        amazon_sku: {
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
        search_item: {
            type: DataTypes.STRING,
            allowNull: true
         },
// attributes data
        condition: {
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
// personal data
        first_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        },
        zipcode: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
// foreign key data
        user_name: {
          type: DataTypes.STRING,
          references: {
            model: 'user',
            key: 'name'
           },
        },
        account_name: {
            type: DataTypes.STRING,
            references: {
              model: 'account',
              key: 'name'
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
          },
        container_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'container',
              key: 'id'
             
             },
          }
    },
    {
      sequelize,
      freezeTableName: true,
      underscored: true,
      modelName: 'dress'
    }
  );

  module.exports = dress;
