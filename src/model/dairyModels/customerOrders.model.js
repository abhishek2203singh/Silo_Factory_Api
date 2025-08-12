import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";


const CustomerOrdersModel = sequelize.define('CustomerOrders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    master_packing_size_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    requested_delivery_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    delivery_status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false
    },
    delivery_charge: {
        type: DataTypes.DECIMAL(11, 2),
        defaultValue: 0.00
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    delivery_boy_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_price: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.TINYINT(1),
        allowNull: false
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        onUpdate: 'CURRENT_TIMESTAMP'
    },
    created_by: {
        type: DataTypes.INTEGER,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'Customer_Orders',
    timestamps: false, // Since createdOn and updatedOn are manually managed
    freezeTableName: true // Avoids pluralization of table name
});

// Export the model
export { CustomerOrdersModel };
