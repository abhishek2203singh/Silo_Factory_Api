import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";// Ensure you have the Sequelize instance

const VkSchedulerTimeUser = sequelize.define('VkSchedulerTimeUser', {
  sti_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sti_schdule_time: {
    type: DataTypes.STRING, // Adjust based on the actual type in your DB (e.g., DATE/TIMESTAMP)
    allowNull: true
  },
  sti_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sti_created_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  minimumschduleingbalance: {
    type: DataTypes.DECIMAL(11, 2),
    allowNull: true,
  },
  sti_updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sti_updated_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  socket_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_working_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  facebook_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  about_me: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  available_balance: {
    type: DataTypes.DECIMAL(11, 2),
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(11, 2),
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  online_status: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  adhaar_no: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dist_center_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sub_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sub_stop_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  firebase_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updated_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Vk_Schduler_time_User', // Explicit table name for the view
  timestamps: false, // Disable Sequelize's auto-created timestamps
  freezeTableName: true, // Prevent Sequelize from pluralizing table names
  paranoid: false // Views typically don't need soft delete functionality
});

export { VkSchedulerTimeUser };

