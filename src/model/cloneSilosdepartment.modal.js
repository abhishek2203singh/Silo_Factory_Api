
import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
const ClonesiloDepartmentUpdateModal = sequelize.define('Silo_Department_Update', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    entry_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    activity: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    approval_status_by_destination: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    date: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    distributed_quantity: {
        type: DataTypes.DECIMAL(11, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    unit_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    db_table_name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    db_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ref_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    with_approval: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ms_product_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,

    },
    master_packing_size_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'Silo_Department_Update',
    timestamps: false
});

export { ClonesiloDepartmentUpdateModal };
