import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const UserDetailView = sequelize.define(
    "Vk_user",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        socket_id: {
            type: DataTypes.STRING,
        },
        department_name: {
            type: DataTypes.STRING,
        },
        role_name: {
            type: DataTypes.STRING,
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
        last_working_date: {
            type: DataTypes.DATE,
        },
        registration_date: {
            type: DataTypes.DATE,
        },
        joining_date: {
            type: DataTypes.DATE,
        },
        address: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.INTEGER,
        },
        state: {
            type: DataTypes.INTEGER,
        },
        pincode: {
            type: DataTypes.STRING,
        },
        profile_photo: {
            type: DataTypes.STRING,
        },
        department_id: {
            type: DataTypes.INTEGER,
        },
        facebook_id: {
            type: DataTypes.STRING,
        },
        google_id: {
            type: DataTypes.STRING,
        },
        about_me: {
            type: DataTypes.STRING,
        },
        role_id: {
            type: DataTypes.INTEGER,
        },
        available_balance: {
            type: DataTypes.FLOAT,
        },
        salary: {
            type: DataTypes.FLOAT,
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
        adhaar_no: {
            type: DataTypes.STRING,
        },
        dist_center_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.STRING,
        },
        sub_start_date: {
            type: DataTypes.DATE,
        },
        sub_stop_date: {
            type: DataTypes.DATE,
        },
        firebase_token: {
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
        gender: {
            type: DataTypes.STRING,
        },
        city_name: {
            type: DataTypes.STRING,
        },
        state_name: {
            type: DataTypes.STRING,
        },
        assignDeliveryBoy: {
            type: DataTypes.INTEGER,
        },
        deliveryBoyName: {
            type: DataTypes.STRING,
        },
        customerSubscription: {
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: "Vk_user",
        timestamps: false,
        // Since it's a view, you might want to set the model to be readonly
        // so that Sequelize doesn't attempt to perform any INSERT/UPDATE/DELETE
        // operations on this model.
        freezeTableName: true,
    }
);

export { UserDetailView };
