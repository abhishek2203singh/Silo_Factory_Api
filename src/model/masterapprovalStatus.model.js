import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path to your Sequelize instance

const MasterApprovalStatus = sequelize.define(
    "Master_ApprovalStatus",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT, // 'TEXT' is a more suitable type for 'longtext'
            allowNull: false,
        },
        is_deletable: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: false,
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
        }, created_on: {
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
        sequelize,
        modelName: "MasterApprovalStatus",
        tableName: "Master_ApprovalStatus",
        timestamps: false, // Set to true if your table has timestamps
        underscored: true, // Set to true if you prefer snake_case
    }
);

export { MasterApprovalStatus };
