import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VkInfoApprovalVkQualityApprovalMng = sequelize.define('Vk_info_approval_VkQulityapprovalMng', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    qualityapproval_mang_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    approval_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mstapprovalstatus_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    approval_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message_val: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: true
    },
    qtyapmg_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    qtyapmg_product_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_quantity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    qtyapmg_unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_db_table_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_db_table_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_in_departmenthead_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_in_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_send_departmenthead_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_send_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_approvalstatus_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_approval_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_approval_datetime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    qtyapmg_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_created_on: {
        type: DataTypes.DATE,
        allowNull: true
    },
    qtyapmg_updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    qtyapmg_updated_on: {
        type: DataTypes.DATE,
        allowNull: true
    },
    qtyapmg_product_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_product_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    QtyMg_send_db_table_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_unitName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_indeprt_head_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_indeprt_head_mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_indeprt_head_profile_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_indeprt_head_online_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    qtyapmg_indeprt_head_gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_indeprt_head_about_me: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    qtyapmg_indeprt_head_role_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_indepart_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_send_deprthead_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_send_head_mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_send_head_profile_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_send_head_online_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    qtyapmg_send_head_gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_send_deprt_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_approval_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qtyapmg_approval_by_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entry_type_name: {
        type: DataTypes.STRING,
    }
}, {
    sequelize,
    modelName: 'VkInfoApprovalVkQualityApprovalMng',
    tableName: 'Vk_info_approval_VkQulityapprovalMng',
    timestamps: false,
    //schema: 'your_schema_name' // Add your schema name if necessary
});

export { VkInfoApprovalVkQualityApprovalMng };