import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";
const PackagingDepartmentViewModel = sequelize.define(
    "VK_Packaging_Department",
    {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        EntryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        entryTypeName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        destination_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        destinationname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sDepartdate: {
            type: DataTypes.DATE,
            allowNull: true,
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
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        distributed_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        rejected_quantity: {
            type: DataTypes.INTEGER,
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
        dbtableName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dbtableId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        withApproval: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        approval_status: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approvalname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        packidStatus: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        Name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "VK_Packaging_Department",
        timestamps: false, // Set to false if your view doesn't include createdAt and updatedAt
    }
);

export { PackagingDepartmentViewModel };
