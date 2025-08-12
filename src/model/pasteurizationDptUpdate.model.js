import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import Sequelize from "sequelize";

const PasteurizationDptUpdateModel = sequelize.define(
    "Pasteurization_Department_Update",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        ref_table_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        distributed_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: true,
            defaultValue: 0,
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
        activity: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        db_table_name: {
            type: DataTypes.TEXT,
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
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
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

        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "Pasteurization_Department_Update",
        timestamps: false,
    }
);

// Foreign key constraint association
PasteurizationDptUpdateModel.associate = function (models) {
    PasteurizationDptUpdateModel.belongsTo(models.Pasteurization_Department, {
        foreignKey: "ref_table_id",
    });
};

export { PasteurizationDptUpdateModel };
