import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
import Sequelize from "sequelize";

const DeliveryPaymentsModal = sequelize.define('DeliveryPayments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    daily_delivery_scheduling_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customer_main_balance: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    customer_dabit_balance: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Delivery_Payments',
    timestamps: false, // If created_on and updated_on are manually handled
});

export { DeliveryPaymentsModal };
