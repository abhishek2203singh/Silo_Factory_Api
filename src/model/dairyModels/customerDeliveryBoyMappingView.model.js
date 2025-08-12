
import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
const VkCustomerDeliveryBoyMapping = sequelize.define('VK_Customer_Delivery_Boy_Mapping', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cust_dist_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    d_boy_dist_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'VK_Customer_Delivery_Boy_Mapping',
    timestamps: false
});

export default VkCustomerDeliveryBoyMapping