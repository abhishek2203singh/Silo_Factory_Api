import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path if necessary
const ProductModel = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        product_image: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        mrp: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false
        },
        base_price: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false
        },
        cgst: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false
        },
        sgst: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false
        },
        delivery_charges: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false
        },
        uom: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        rough_product_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'product from which this product made of like=> packed milk is made of rough milk'
        },
        is_other_product: {
            type: DataTypes.TINYINT,
            defaultValue: null,
            comment: 'in case of non-milk products like :=> packaging materials and other materials'
        },
        sort: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        is_gst_included: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.TINYINT(1),
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
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: "Product",
        timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

export { ProductModel };
