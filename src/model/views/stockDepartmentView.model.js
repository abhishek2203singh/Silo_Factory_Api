import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const StockDepartmentView = sequelize.define(
    "VK_Stock_Department",
    {
        sdId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        EntryId: {
            type: DataTypes.INTEGER,
        },
        entryTypeName: {
            type: DataTypes.STRING,
        },
        DeprtId: {
            type: DataTypes.INTEGER,
        },
        departmentName: {
            type: DataTypes.STRING,
        },
        departmentHeadName: {
            type: DataTypes.STRING,
        },
        destination_status: {
            type: DataTypes.INTEGER,
        },
        weight: {
            type: DataTypes.STRING,
        },
        priceperunit: {
            type: DataTypes.STRING,
        },
        appmangerName: {
            type: DataTypes.STRING,
        },
        approvalname: {
            type: DataTypes.STRING,
        },
        sDepartdate: {
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
        distributed_quantity: {
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
        sdStatus: {
            type: DataTypes.INTEGER,
        },
        Name: {
            type: DataTypes.STRING,
        },
        createBy: {
            type: DataTypes.INTEGER,
        },
        created_on: {
            type: DataTypes.DATE,
        },
        unitName: {
            type: DataTypes.STRING,
        },
        self_approval: {
            type: DataTypes.INTEGER,
        },
        self_approval_name: {
            type: DataTypes.STRING,
        }

    },
    {
        tableName: "VK_Stock_Department",
        timestamps: false,
    }
);

export { StockDepartmentView };
