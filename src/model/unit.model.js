import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConfig.js"; // Adjust the path if necessary

// import { MasterCities } from "./masterCities.model.js";
// import { MasterDepartment } from "./masterDepartment.model.js";
// import { MasterUserRole } from "./masterUserRole.model.js";
// import { MasterState } from "./masterState.model.js";

const UnitModel = sequelize.define('Master_units', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(450),
        allowNull: false
    },
    st_name: {
        type: DataTypes.STRING(5),
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    update_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updated_on: {
        type: DataTypes.DATE,
        allowNull: true
    }
},
    {
        tableName: "Master_units",
        timestamps: false, // Disables automatic timestamp fields (createdAt, updatedAt)
        charset: "utf8mb4",
        collate: "utf8mb4_0900_ai_ci",
    }
);

// // Define relationships
// UserModel.belongsTo(MasterCities, { foreignKey: "city", targetKey: "id" });
// UserModel.belongsTo(MasterDepartment, {
//   foreignKey: "department_id",
//   targetKey: "Id",
// });
// UserModel.belongsTo(MasterUserRole, { foreignKey: "role_id", targetKey: "id" });
// UserModel.belongsTo(MasterState, { foreignKey: "state", targetKey: "id" });

export { UnitModel };
