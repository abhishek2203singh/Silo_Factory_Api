import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";
const EcommerceUserModel = sequelize.define(
    "Ecommerce_User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        address: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
        },
        city: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        state: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        pincode: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        facebook_page: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        about_me: {
            type: DataTypes.TEXT,
            allowNull: true,
            charset: "utf8mb4",
            collate: "utf8mb4_0900_ai_ci",
        },
        latitude: {
            type: DataTypes.DECIMAL(12, 9),
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DECIMAL(12, 9),
            allowNull: true,
        },
        online_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.TINYINT(1),
            allowNull: false,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        securtiy_money: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            validate: { min: 0, },
        }
    },
    {
        tableName: 'Ecommerce_User',  // Replace with your actual table name
        timestamps: false,  // If you don't want Sequelize to automatically handle createdAt/updatedAt
    }
);

export { EcommerceUserModel };
