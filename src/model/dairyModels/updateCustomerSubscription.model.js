import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
import Sequelize from "sequelize";
const CustomerSubscriptionsUpdateModel = sequelize.define('CustomerSubscriptionsUpdate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ref_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_price: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
        defaultValue: 0
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
        allowNull: true,
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
        allowNull: true,
        defaultValue: 0,
    },
    monday: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    tuesday: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    wednesday: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    thursday: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    friday: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    saturday: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    one_day_change_quantity: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    activity: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    new_quantity: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Customer_Subscriptions_Update',
    timestamps: false, // Disables Sequelize's default createdAt and updatedAt fields
});

export { CustomerSubscriptionsUpdateModel };
