import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const OtherDepartmentViewModal = sequelize.define(
    "VK_Other_Department",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        entryTypeName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approvalname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DepartmenheadName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Department_Name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        current_department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        destination_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        self_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        rejected_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        distributed_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        unitname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        db_table_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        priceper_unit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "VK_Other_Department", // Optional: Name of the table in the database
        timestamps: false, // Optional: Set to false if you don't want Sequelize to add `createdAt` and `updatedAt` fields automatically
    }
);
export { OtherDepartmentViewModal };
