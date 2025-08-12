import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";
import { MasterPasteurizationSilosModel } from "./masterPasteurizationSilo.model.js";

const PasteurizationInfoModel = sequelize.define(
    "Pasteurization_Info",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        mst_silos_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        milk_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        dpt_table_ref_id: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },

        trns_type: {
            type: DataTypes.ENUM("in", "out"),
            allowNull: false,
            comment: "IN/OUT",
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
    },
    {
        tableName: "Pasteurization_Info",
        timestamps: false,
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

// TODO: add relations
PasteurizationInfoModel.belongsTo(MasterPasteurizationSilosModel, {
    foreignKey: "mst_silos_id",
});

export { PasteurizationInfoModel };
