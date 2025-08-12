import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";


const PackingProcessViewModel = sequelize.define('VK_Packing_Process', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    unit_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    st_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_packings: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    packing_material: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prouduct_unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    total_product_packed: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_u_stname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_on: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    finish_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    tableName: 'VK_Packing_Process',
    timestamps: false,
});

export { PackingProcessViewModel };
