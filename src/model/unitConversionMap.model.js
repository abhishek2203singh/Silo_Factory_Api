
import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const UnitConversionMapModel = sequelize.define(
    'VK_Unit_Converson_Map',
    {
        unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        possible_unit_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unit_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        possible_unit_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        st_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'VK_Unit_Converson_Map',
        timestamps: false,
        underscored: true,
    }
);

export { UnitConversionMapModel };
