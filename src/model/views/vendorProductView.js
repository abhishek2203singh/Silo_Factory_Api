import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VendorProductsViewModel = sequelize.define('VK_Vendor_Products', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_type_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shortName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    ms_product_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    vendor_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }, status: {
        type: DataTypes.TINYINT,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'VK_Vendor_Products',
    timestamps: false,
});

export { VendorProductsViewModel }