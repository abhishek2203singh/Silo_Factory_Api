import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path as necessary

const MasterDepartmentModel = sequelize.define(
    "MasterDepartment",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(450),
            allowNull: false,
        },
        table_name: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
            defaultValue: "Other_Department",
        },
        model_name: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
            defaultValue: "Other_Department",
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        is_deletable: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: false,
        }, created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Master_Department",
        timestamps: false,
    }
);

export { MasterDepartmentModel };
