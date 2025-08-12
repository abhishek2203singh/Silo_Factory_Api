import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterSchedulingStatusModel = sequelize.define('Master_Scheduling_Status', {
    id: {
        type: DataTypes.TINYINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    status: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: 'Master_Scheduling_Status',
    timestamps: false, // No timestamps in the table
});

export { MasterSchedulingStatusModel };
