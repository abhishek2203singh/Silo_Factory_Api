import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
const VKProductMsUnit = sequelize.define(
    "VK_Product_Unit",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        product_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        product_image: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        rough_product_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        msProductType: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_type_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        rough_product_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'NA'
        },
        cgst: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false
        },
        sgst: {
            type: DataTypes.DECIMAL(11, 2),
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
        unit_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        st_name: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: false
        },
        uom: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    },
    {
        tableName: "Vk_Product_Unit",
        timestamps: false,
    }
);
export { VKProductMsUnit };