import { StockDepartmentModel } from "./stockDepartment.model.js";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const StockDepartmentUpdateModel = sequelize.define(
    "Stock_Department_Update",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        ref_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: StockDepartmentModel, // References the StockDepartment model
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        }, this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: `This will be used when user will send stock to the requested department on the behalf of table id which have entry_type_id=2 (request). 
                      Example: Pasteurization_Department sent a request for 500 liters of milk, stored with id 18. Now, the user wants to send the 500 stock to the Pasteurization_Department. 
                      The upcoming id of entry will be 19, and the 18 will be stored in this field.`
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        selling_price: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "name of destination department where we are sending this entry",
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "head of destination department",
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        self_approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        self_approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        destination_approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        activity: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        distributed_quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        db_table_name: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        with_approval: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Stock_Department_Update",
        timestamps: false,
        indexes: [
            {
                name: "Pasteurization_Department_FK_idx",
                fields: ["ref_table_id"],
            },
        ],
    }
);

// Define the foreign key relation with StockDepartment
StockDepartmentUpdateModel.belongsTo(StockDepartmentModel, {
    foreignKey: "ref_table_id",
    as: "stockDepartment",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
});

export { StockDepartmentUpdateModel };
