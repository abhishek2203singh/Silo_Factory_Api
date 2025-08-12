import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterEntryTypeModel = sequelize.define(
    "Master_Entry_Type",
    {
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
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        is_deletable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: "Master_Entry_Type",
        timestamps: false,
    }
);

export { MasterEntryTypeModel };
