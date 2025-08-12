import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const CustomerDeliveryBoyMappingModel = sequelize.define('CustomerDeliveryBoyMapping', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customer_subscriptions_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'Customer_DeliveryBoy_Maping',
    timestamps: false, // disables Sequelize's default `createdAt` and `updatedAt` fields
});

export { CustomerDeliveryBoyMappingModel }