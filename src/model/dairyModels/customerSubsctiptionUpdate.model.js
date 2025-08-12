// models/CustomerSubscriptionsUpdate.js

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
import Sequelize from "sequelize";

const CustomerSubscriptionsUpdateModel = sequelize.define('CustomerSubscriptionsUpdate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    ref_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'id of Customer_Subscriptions table',
    },
    all_day: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    alternat_day: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    specific_day: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_price: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    master_packing_size_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    regular_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    alternate_day: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    next_alternate_date: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: '0',
    },
    next_dateupdate_no: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    shift: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sunday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    monday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    tuesday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    wednesday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    thursday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    friday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    saturday: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    one_day_change_quantity: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    activity: {
        type: DataTypes.STRING(45),
        allowNull: false,

    },
    description: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    new_quantity: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Customer_Subscriptions_Update',
    timestamps: false,
});

export { CustomerSubscriptionsUpdateModel };
