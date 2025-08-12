import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
import Sequelize from "sequelize";

const DailyDeliveryBoyTransactionsModal = sequelize.define('Daily_Delivery_Boy_Transctions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    issued_total_quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
    },
    total_delivered_quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
    },
    total_return_quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Daily_Delivery_Boy_Transctions',
    timestamps: false, // Disable Sequelize's automatic timestamp fields
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
});

export { DailyDeliveryBoyTransactionsModal };
