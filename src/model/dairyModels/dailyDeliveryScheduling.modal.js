import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
import Sequelize from "sequelize";

const DailyDeliverySchedulingModal = sequelize.define('DailyDeliveryScheduling', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customer_subscription_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    shift: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    delivered_quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
    },
    scheduled_quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: true,
    },
    customer_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    mrp: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    order_type: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    day: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    return_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
    create_invoice_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    create_invoice_statusById: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Daily_Delivery_Scheduling',
    timestamps: false, // Disable Sequelize's automatic timestamp fields
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
});

export { DailyDeliverySchedulingModal };
