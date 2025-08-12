import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path if necessary
import { MasterCities } from "./masterCities.model.js";
import { MasterDepartmentModel } from "./masterDepartment.model.js";
import { MasterUserRole } from "./masterUserRole.model.js";
import { MasterState } from "./masterState.model.js";

const UserModel = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    socket_id: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    last_working_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    registration_Date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: new Date(),
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: new Date(),
    },
    address: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    city: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    state: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pincode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    profile_photo: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    facebook_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    google_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    about_me: {
      type: DataTypes.TEXT,
      allowNull: true,
      charset: "utf8mb4",
      collate: "utf8mb4_0900_ai_ci",
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dist_center_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    available_balance: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    salary: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(12, 9),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(12, 9),
      allowNull: true,
    },
    online_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    sub_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sub_stop_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    firebase_token: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    adhaar_no: {
      type: DataTypes.STRING(12),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
    gender: {
      type: DataTypes.STRING(10),
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
  },
  {
    tableName: "user",
    timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  }
);

// Define relationships
UserModel.belongsTo(MasterCities, {
  foreignKey: "city",
  targetKey: "id",
});
UserModel.belongsTo(MasterDepartmentModel, {
  foreignKey: "department_id",
  targetKey: "id",
});
UserModel.belongsTo(MasterUserRole, { foreignKey: "role_id", targetKey: "id" });
UserModel.belongsTo(MasterState, { foreignKey: "state", targetKey: "id" });

export { UserModel };
