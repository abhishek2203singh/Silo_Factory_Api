import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const EcommerceUserView = sequelize.define(
    "Vk_Ecommerce_User_view",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        full_name: {
            type: DataTypes.STRING,
        },
        mobile: {
            type: DataTypes.STRING,
        },
        date: {
            type: DataTypes.DATE,
        },
        address: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.INTEGER,
        },
        city_name: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.INTEGER,
        },
        state_name: {
            type: DataTypes.STRING,
        },
        pincode: {
            type: DataTypes.STRING,
        },
        facebook_page: {
            type: DataTypes.STRING,
        },
        website: {
            type: DataTypes.STRING,
        },
        about_me: {
            type: DataTypes.TEXT,
        },
        latitude: {
            type: DataTypes.FLOAT,
        },
        longitude: {
            type: DataTypes.FLOAT,
        },
        online_status: {
            type: DataTypes.BOOLEAN,
        },
        status: {
            type: DataTypes.STRING,
        },
        created_by: {
            type: DataTypes.INTEGER,
        },
        created_on: {
            type: DataTypes.DATE,
        },
        updated_by: {
            type: DataTypes.INTEGER,
        },
        updated_on: {
            type: DataTypes.DATE,
        },
        securtiy_money: {
            type: DataTypes.DECIMAL(10, 2),
        },
    },
    {
        tableName: "Vk_Ecommerce_User_view",
        timestamps: false,
    }
);

export { EcommerceUserView };
