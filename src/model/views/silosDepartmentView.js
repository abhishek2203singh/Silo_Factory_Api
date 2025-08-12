import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js"; // Adjust the path to your database configuration

const SiloDepartmentView = sequelize.define(
    "VK_Silo_Department",
    {
        silDId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        EntryId: {
            type: DataTypes.INTEGER,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
        },
        entryTypeName: {
            type: DataTypes.STRING,
        },
        destination_status: {
            type: DataTypes.INTEGER,
        },
        approvalname: {
            type: DataTypes.STRING,
        },
        sDepartdate: {
            type: DataTypes.DATE,
        },
        DepartId: {
            type: DataTypes.INTEGER
        },
        Department_Name: {
            type: DataTypes.STRING
        },
        prodId: {
            type: DataTypes.INTEGER,
        },
        productName: {
            type: DataTypes.STRING,
        },
        qty: {
            type: DataTypes.FLOAT,
        },
        rejected_quantity: {
            type: DataTypes.FLOAT,
        },
        QtysiloBox: {
            type: DataTypes.FLOAT,
        },
        unitId: {
            type: DataTypes.INTEGER,
        },
        unitShortName: {
            type: DataTypes.STRING,
        },
        dbtableName: {
            type: DataTypes.STRING,
        },
        dbtableId: {
            type: DataTypes.INTEGER,
        },
        withApproval: {
            type: DataTypes.BOOLEAN,
        },
        approval_status: {
            type: DataTypes.INTEGER,
        },
        sidStatus: {
            type: DataTypes.STRING,
        },
        Name: {
            type: DataTypes.STRING,
        },
        createBy: {
            type: DataTypes.INTEGER,
        },
        self_approval_status_id: {
            type: DataTypes.INTEGER,
        },
        selfapprovalname: {
            type: DataTypes.STRING,
        },
        created_on: {
            type: DataTypes.DATE,
        },
        updated_on: {
            type: DataTypes.DATE,
        },
        self_approval_datetime: {
            type: DataTypes.DATE,
        },
        unitName: {
            type: DataTypes.STRING,
        },
        appmangerName: {
            type: DataTypes.STRING,
        },
    },
    {
        tableName: "VK_Silo_Department",
        timestamps: false,
    }
);

export { SiloDepartmentView };
