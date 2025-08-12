import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import { ProductModel } from "./product.model.js";
import Sequelize from "sequelize";
// import { UserModel } from "./user.model.js";
const QualityControlModel = sequelize.define(
    "Quality_Control",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }, this_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: `This will be used when user will send stock to the requested department on the behalf of table id which have entry_type_id=2 (request). 
                      Example: Pasteurization_Department sent a request for 500 liters of milk, stored with id 18. Now, the user wants to send the 500 stock to the Pasteurization_Department. 
                      The upcoming id of entry will be 19, and the 18 will be stored in this field.`
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        admin_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
        priceper_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        db_table_name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        approval_status_by_destination: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        bill_image: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
        },
        payment_status_to_vendor: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: 0.0,
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
        tableName: "Quality_Control",
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

// Define associations
QualityControlModel.associate = (models) => {
    QualityControlModel.belongsTo(models.User, {
        foreignKey: "vendorId",
        as: "vendor",
    });
    QualityControlModel.belongsTo(ProductModel, { foreignKey: "product_id" });
    QualityControlModel.belongsTo(models.MasterUnit, { foreignKey: "unit_id" });
    QualityControlModel.belongsTo(models.MasterDepartment, {
        foreignKey: "department_id",
    });
    QualityControlModel.belongsTo(models.User, {
        foreignKey: "departmenthead_id",
    });
    QualityControlModel.belongsTo(models.MasterApprovalStatus, {
        foreignKey: "approval_status_id",
    });
    QualityControlModel.belongsTo(models.User, {
        foreignKey: "approval_by",
    });
};

export { QualityControlModel };
