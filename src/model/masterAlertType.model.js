import { sequelize } from "../config/dbConfig.js";
import { DataTypes } from "sequelize";
const MasterAlertTypeModel = sequelize.define(
    "Master_Alert_Type",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        status: {
            type: DataTypes.TINYINT,
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
        tableName: "Master_Alert_Type",
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

export { MasterAlertTypeModel };
