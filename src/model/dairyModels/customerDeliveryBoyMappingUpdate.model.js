import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
const CustomerDeliveryBoyMappingUpdateModel = sequelize.define('Customer_DeliveryBoy_Maping_Update', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    ref_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    activity: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },


    customer_subscriptions_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Customer_DeliveryBoy_Maping_Update',
    timestamps: false,
});

export { CustomerDeliveryBoyMappingUpdateModel };
