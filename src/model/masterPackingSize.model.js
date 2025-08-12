import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path as necessary

const MasterPackingSizeModel = sequelize.define(
    "Master_Packing_Size",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        weight: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
        },
        mrp: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        tableName: "Master_Packing_Size",
        timestamps: false,
    }
);

export { MasterPackingSizeModel };
