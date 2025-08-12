// SiloInfo.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

import { MasterSilosModel } from "./masterSilos.model.js";
import { UserModel } from "./user.model.js";

const InfoSilosModel = sequelize.define(
    "Silo_Info",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        mst_silos_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MasterSilosModel,
                key: "id",
            },
        },
        dpt_table_ref_id: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        milk_quantity: {
            type: DataTypes.DECIMAL(11, 2),
            allowNull: false,
        },
        // hold_quantity: {
        //     type: DataTypes.DECIMAL(11, 2),
        //     allowNull: false,
        // },
        milk_status: {
            type: DataTypes.STRING(10),
            allowNull: false,
            comment: "IN/OUT",
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: UserModel,
                key: "id",
            },
        },
        trns_type: {
            type: DataTypes.ENUM("in", "out"),
            allowNull: false,
            comment: "IN/OUT",
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "Silo_Info",
        timestamps: false,
        indexes: [
            {
                name: "fk_userId_idx",
                fields: ["created_by"],
            },
            {
                name: "fk_mstSilo_idx",
                fields: ["mst_silos_id"],
            },
        ],
    }
);

// Associations
InfoSilosModel.belongsTo(MasterSilosModel, {
    foreignKey: "mst_silos_id",
    as: "masterSilo",
});

InfoSilosModel.belongsTo(UserModel, {
    foreignKey: "created_by",
    as: "createdByUser",
});

// (async () => {
//   try {
//     const res = await InfoSilosModel.sync({ force: true });
//     console.log("res=>", res);
//   } catch (error) {
//     console.log(error);
//   }
// })();
export { InfoSilosModel };
