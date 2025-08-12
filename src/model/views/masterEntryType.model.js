import { DataTypes } from "sequelize";
import sequelize from "./path/to/your/sequelize/instance"; // Adjust the path accordingly

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
        is_delete: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        tableName: "Master_Entry_Type",
        timestamps: false,
    }
);

export { MasterEntryTypeModel };
