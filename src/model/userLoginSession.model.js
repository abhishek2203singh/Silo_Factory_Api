import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path to your database configuration

const UserLoginSessionModel = sequelize.define(
  "UserLoginSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user", // Name of the table referenced in the foreign key
        key: "id", // Key in the referenced table
      },
    },
    jwt_token: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    log_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    log_off_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    socket_token: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    login_device_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "MasterDeviceType", // Name of the table referenced in the foreign key
        key: "id", // Key in the referenced table
      },
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "User_Login_Session",
    timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

export { UserLoginSessionModel };
