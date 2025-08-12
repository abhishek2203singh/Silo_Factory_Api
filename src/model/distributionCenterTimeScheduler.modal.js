import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";


const schedulingTimeModel = sequelize.define('SchedulerTime', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    distribution_center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    schdule_time: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    minimum_schduleing_balance: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Schduler_Time',
    timestamps: false,
});

export { schedulingTimeModel };
