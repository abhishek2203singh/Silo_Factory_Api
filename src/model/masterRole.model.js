import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js";

const MasterRoleModel = sequelize.define(
  "MasterUserRole",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(450),
      allowNull: false,
    },

    status: {
      type: DataTypes.BOOLEAN(true),
      defaultValue: true,
      allowNull: false,
    },
    is_deletable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Master_User_Role",
    timestamps: false,
  }
);

export { MasterRoleModel };
