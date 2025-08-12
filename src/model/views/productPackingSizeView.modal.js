import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VkProductPackingSizeModel = sequelize.define(
    "VK_Product_Packing_Size",
    {
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
        weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        mrp: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        st_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
        }
    },
    {
        tableName: "VK_Product_Packing_Size",
        timestamps: false,
        freezeTableName: true,
    }
);

export { VkProductPackingSizeModel };
