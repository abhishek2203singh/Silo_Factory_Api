import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterSilosModel = sequelize.define(
    "Master_Silos",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        silo_name: {
            type: DataTypes.STRING(450),
            allowNull: true, // Since the column can be NULL
        },
        capacity: {
            type: DataTypes.STRING(45),
            allowNull: true, // Since the column can be NULL
        },
        total_available_milk: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        hold_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        is_deletable: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: false,
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
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true, // Since the column can be NULL
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Master_Silos",
        timestamps: false,
        indexes: [
            {
                name: "fk_userSilos_idx",
                fields: ["created_by"],
            },
        ],
    }
);

export { MasterSilosModel };
