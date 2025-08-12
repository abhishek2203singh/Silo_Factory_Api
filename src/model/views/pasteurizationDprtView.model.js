import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";


// Adjust the path to your database config

const PasteurizationDepartmentModel = sequelize.define('VK_Pasteurization_Department', {
    pid: {
        type: DataTypes.INTEGER,
        primaryKey: true,

    },
    EntryId: {
        type: DataTypes.INTEGER,

    },
    entryTypeName: {
        type: DataTypes.STRING,

    },
    DepartId: {
        type: DataTypes.INTEGER,

    },
    Department_Name: {
        type: DataTypes.STRING,

    },
    DepartHId: {
        type: DataTypes.INTEGER,

    },
    self_approval_status_id: {
        type: DataTypes.INTEGER,

    },
    DepartmenheadName: {
        type: DataTypes.STRING,

    },
    destination_status: {
        type: DataTypes.STRING,

    },
    approvalname: {
        type: DataTypes.STRING,

    },
    pDepartdate: {
        type: DataTypes.DATE,

    },
    prodId: {
        type: DataTypes.INTEGER,

    },
    admin_table_id: {
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
    manager_approval: {
        type: DataTypes.STRING,
    },
    pidStatus: {
        type: DataTypes.STRING,

    },
    createBy: {
        type: DataTypes.STRING,

    },
    Name: {
        type: DataTypes.STRING,

    },
    created_on: {
        type: DataTypes.DATE,

    },
}, {
    tableName: 'VK_Pasteurization_Department',
    timestamps: false, // Assuming the view doesn't have timestamps
});


export { PasteurizationDepartmentModel };
