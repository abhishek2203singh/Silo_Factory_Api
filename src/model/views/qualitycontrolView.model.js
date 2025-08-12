// models/vkQualityControls.js

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const qualityContUserDptUntView = sequelize.define(
    "VK_Quality_Control",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vru_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rg_date: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        join_date: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        rejected_quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UntName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unit_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        priceper_unit: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        DprtName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DprtHeadFullName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ApprvlSts_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ApprvlbyFullName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bill_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payment_status_to_vendor: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        mps_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payment_approve_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        pstsby_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        payment_status_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_type_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        packing_size: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        st_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        vendor_profile_photo: {
            type: DataTypes.STRING,
        },
        about_me: {
            type: DataTypes.TEXT,
        }
    },
    {
        tableName: "VK_Quality_Control",
        timestamps: false,
    }
);

export { qualityContUserDptUntView };
