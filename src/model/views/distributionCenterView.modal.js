import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VKDistributionCenterDepartmentModal = sequelize.define(
    "VK_DistributionCenter_Department",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        productID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unitId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unitShortName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        EntryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        rejected_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        weight: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        priceperUnit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        distCenterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        distCenterName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        entryTypeName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        DepartId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Department_Name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        DepartHId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        DepartmenheadName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        destination_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approvalname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        appmangerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        weight_packing: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        weight_packing_st_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        distributed_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
    },
    {
        tableName: "VK_DistributionCenter_Department",
        timestamps: false, // Since it's a view, we don't have createdAt or updatedAt columns
        freezeTableName: true, // Ensures that Sequelize doesn't try to pluralize the table name
    }
);
export { VKDistributionCenterDepartmentModal };
