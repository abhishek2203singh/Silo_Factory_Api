import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const PasteurizationInfoView = sequelize.define('VK_PasteurizationInfo', {

    silo_info_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    mst_silos_id: {
        type: DataTypes.INTEGER
    },
    silo_name: {
        type: DataTypes.STRING
    },
    capacity: {
        type: DataTypes.INTEGER
    },
    total_available_milk: {
        type: DataTypes.INTEGER
    },
    dpt_table_ref_id: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING
    },
    milk_quantity: {
        type: DataTypes.DECIMAL(11, 2)
    },
    hold_quantity: {
        type: DataTypes.DECIMAL(11, 2)
    },
    trns_type: {
        type: DataTypes.STRING
    },
    silo_info_created_by: {
        type: DataTypes.INTEGER
    },
    silo_info_created_on: {
        type: DataTypes.DATE
    },
    master_silo_status: {
        type: DataTypes.STRING
    },
    master_silo_created_by: {
        type: DataTypes.INTEGER
    },
    master_silo_created_on: {
        type: DataTypes.DATE
    },
    master_silo_updated_by: {
        type: DataTypes.INTEGER
    },
    master_silo_updated_on: {
        type: DataTypes.DATE
    },
    is_deletable: {
        type: DataTypes.BOOLEAN
    },
    created_on: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VK_PasteurizationInfo',
    timestamps: false // since we have custom created/updated fields
});

export { PasteurizationInfoView };