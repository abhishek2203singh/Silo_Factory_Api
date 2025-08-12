import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
const CustomerDeliveryBoyMappingUpdateModal = sequelize.define('Customer_DeliveryBoy_Maping_Update', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    ref_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_subscriptions_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activity: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Customer_DeliveryBoy_Maping_Update',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_ai_ci'
});

export { CustomerDeliveryBoyMappingUpdateModal };
