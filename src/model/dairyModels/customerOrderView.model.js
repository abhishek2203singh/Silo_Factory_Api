import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";


const CustomerOrdersViewModel = sequelize.define('VK_Customer_Orders', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
    },
    cust_name: {
        type: DataTypes.STRING,
    },
    cust_mobile: {
        type: DataTypes.STRING,
    },
    cust_id: {
        type: DataTypes.INTEGER,
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
    },
    product_name: {
        type: DataTypes.STRING,
    },
    base_price: {
        type: DataTypes.FLOAT,
    },
    requested_delivery_date: {
        type: DataTypes.DATE,
    },
    mrp: {
        type: DataTypes.FLOAT,
    },
    delivery_charges: {
        type: DataTypes.FLOAT,
    },
    uom: {
        type: DataTypes.INTEGER,
    },
    unit_name: {
        type: DataTypes.STRING,
    },
    st_name: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.FLOAT,
    },
    quantity: {
        type: DataTypes.INTEGER,
    },
    total_price: {
        type: DataTypes.FLOAT,
    },
    delivery_boy_name: {
        type: DataTypes.STRING,
    },
    delivery_boy_id: {
        type: DataTypes.STRING,
    },
    order_date: {
        type: DataTypes.DATE,
    },
    packing_weight: {
        type: DataTypes.FLOAT,
    },
    packing_mrp: {
        type: DataTypes.FLOAT,
    },
    status: {
        type: DataTypes.INTEGER,
    },
    delivery_status: {
        type: DataTypes.INTEGER,
    },
    delivery_status_name: {
        type: DataTypes.STRING,
    }
}, {
    tableName: 'VK_Customer_Orders',
    timestamps: false, // Views typically do not have timestamps
});

export { CustomerOrdersViewModel };
