import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
const CustomerDeliveryBoyMappingModal = sequelize.define('CustomerDeliveryBoyMapping', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    customer_id: {
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
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'Customer_DeliveryBoy_Maping',
    timestamps: false,
    underscored: true
});


export { CustomerDeliveryBoyMappingModal }
