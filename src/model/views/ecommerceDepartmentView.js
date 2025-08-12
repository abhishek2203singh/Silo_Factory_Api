import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const EcommerceDepartmentView = sequelize.define(
    "Vk_Ecommerce_Department",
    {
        eDId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        EntryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        entryTypeName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        EcommUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        masterPckSizeUnit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        EcommUsrName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        facebook_page: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        about_me: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        eDepartdate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        prodId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        qty: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        rejected_quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        weight_per_unit: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        priceper_unit: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        online_status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        securtiy_money: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        statename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cityname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        department_headName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unitId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitShortName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        withApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        approval_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approvalStatusName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        edStatus: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Vk_Ecommerce_Department",
        timestamps: false,
    }
);

export { EcommerceDepartmentView };
