import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"


const MasterVendorProductsModel = sequelize.define(
    'MasterVendorProducts',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.TINYINT,
        },
        price: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'Master_Vendor_Products',
        timestamps: false,
    }
);

export { MasterVendorProductsModel };
