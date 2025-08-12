import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const InfoApprovals = sequelize.define(
    "InfoApInfo_Approvalsprovals",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        qualityapproval_mang_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approval_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        approved_quanity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        rejected_quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        original_quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        mstapprovalstatus_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message_val: {
            type: DataTypes.TEXT("long"),
            allowNull: true, // Assuming `longtext` can be nullable
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        created_on: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    },
    {
        tableName: "Info_Approvals",
        timestamps: false, // Assuming you don't want Sequelize to handle createdAt and updatedAt
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

export { InfoApprovals };
