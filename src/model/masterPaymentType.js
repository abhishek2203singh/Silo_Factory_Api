import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterPaymentTypeModal = sequelize.define('Master_Payment_Type', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
    },
    is_deletable: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Master_Payment_Type',
    timestamps: false,  // Set this to true if you have 'createdAt' and 'updatedAt' columns
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_ai_ci',
});

export { MasterPaymentTypeModal };
