import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

// Define the Vk_QulityApprovalMngAdm model (for a view)
const VkQulityApprovalMngAdm = sequelize.define(
    "Vk_QulityApprovalMngAdm",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        admin_table_ref_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        rejected_quantity: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        db_table_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        db_table_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        dist_center_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DistCentName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        in_departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_status_by_destination: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        in_department_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        send_departmenthead_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_status_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        vendor_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        priceper_unit: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: "0.00",
        },
        approved_qty: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
            defaultValue: "0.00",
        },
        send_department_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        approval_datetime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        entry_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        entry_type_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_db_table_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        updated_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        product_image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unitName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        unit_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_profile_photo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_online_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_about_me: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indeprt_head_role_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        indepart_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_deprthead_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_head_mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_head_profile_photo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_head_online_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_head_gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        send_deprt_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approval_status: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        approval_by_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ms_product_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        master_packing_size_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        master_product_type_name: {
            type: DataTypes.STRING,
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
        packing_weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        st_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },

    },
    {
        tableName: "Vk_QulityApprovalMngAdm",
        timestamps: false,
    }
);

// Export the model
export default VkQulityApprovalMngAdm;

export { VkQulityApprovalMngAdm };
