import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const SiloInfoView = sequelize.define('Vk_SiloInfo', {
    silo_info_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    mst_silos_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    silo_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dpt_table_ref_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    hold_quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    milk_quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    milk_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    silo_info_created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    silo_info_created_on: {
        type: DataTypes.DATE,
        allowNull: false
    },
    master_silo_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    capacity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    total_available_milk: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    master_silo_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    master_silo_created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    master_silo_created_on: {
        type: DataTypes.DATE,
        allowNull: false
    },
    master_silo_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    master_silo_updated_on: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_deletable: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    silo_department_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    entry_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approval_status_by_destination: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    distributed_quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unit_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    db_table_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    db_table_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    departmenthead_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    with_approval: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    silo_department_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    approval_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approval_datetime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    silo_department_created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    silo_department_created_on: {
        type: DataTypes.DATE,
        allowNull: false
    },
    silo_department_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    silo_department_updated_on: {
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    tableName: 'Vk_SiloInfo', // Replace with the actual name of your view
    timestamps: false,  // Assuming the view does not handle createdAt/updatedAt automatically
});

export { SiloInfoView };
