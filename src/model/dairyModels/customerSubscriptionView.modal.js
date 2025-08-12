import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VkCustomerSubscriptionDetailsModal = sequelize.define('Vk_Customer_Subscription_Details', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shift_time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    dist_center_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    userActualBalance: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: true,
    },
    master_packing_size_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    st_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Vk_Customer_Subscription_Details', // Match your view name
    timestamps: false, // Views typically don't have createdAt/updatedAt columns
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
});

export { VkCustomerSubscriptionDetailsModal };
