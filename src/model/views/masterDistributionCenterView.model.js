import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const MasterDistributionCenterViewModel = sequelize.define(
    "Vk_Master_Distribution_Center",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        center_name: {
            type: DataTypes.STRING(95),
            allowNull: false,
            unique: true,
        },
        center_code: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        cityId: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        cityName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        manager_or_owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stateName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        pincode: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(255),
            defaultValue: null,
            unique: true,
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1,
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
            defaultValue: null,
        },
        updated_on: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        is_deletable: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "Vk_Master_Distribution_Center",
        timestamps: false, // Disable automatic timestamp fields (createdAt, updatedAt)
    }
);

export { MasterDistributionCenterViewModel };
