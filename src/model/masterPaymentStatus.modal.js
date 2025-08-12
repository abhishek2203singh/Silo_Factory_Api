import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
const MasterPaymentStatusModal = sequelize.define('MasterPaymentStatus', {
    Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    is_deletable: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    }, created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Master_Payment_Status',
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
});


export { MasterPaymentStatusModal }
