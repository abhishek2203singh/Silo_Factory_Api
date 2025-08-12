import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterPasteurizationSilosModel = sequelize.define(
    "Master_Pasteurization_silos",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        silo_name: {
            type: DataTypes.STRING(450),
            allowNull: true,
        },
        capacity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
        },
        total_available_milk: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,

        },
        hold_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,

        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
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
            defaultValue: DataTypes.NOW,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "Master_Pasteurization_silos",
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

export { MasterPasteurizationSilosModel };
