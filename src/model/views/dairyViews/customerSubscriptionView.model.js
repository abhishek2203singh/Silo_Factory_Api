import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/dbConfig.js";


const CustomerSubscriptionViewModel = sequelize.define(
    'VK_Customer_Subscriptions',
    {
        sub_status: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'sub_status',
        },
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'id',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'userId',
        },
        distribution_center_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'distribution_center_id',
        },
        subscription_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'subscription_id',
        },

        customer_name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'customer_name',
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'created_on',
        },
        delivery_boy_name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'delivery_boy_name',
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'productId',
        },
        weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'weight',
        },
        packingSizeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'packingSizeId',
        },
        unit_name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'unit_name',
        },
        sort_unit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'sort_unit',
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'product_name',
        },
        allDay: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'allDay',
        },
        alternatDay: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'alternatDay',
        },

        specificDay: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'specificDay',
        },

        userPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'userPrice',
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'quantity',
        },
        deliveryBoyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'deliveryBoyId',
        },
        sunday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'sunday',
        },
        monday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'monday',
        },
        tuesday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'tuesday',
        },
        wednesday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'wednesday',
        },
        thursday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'thursday',
        },
        friday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'friday',
        },
        saturday: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'saturday',
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'role_id',
        },
        shift: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'shift',
        },
        shift_name: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'shift_name',
        },
    },
    {
        tableName: 'VK_Customer_Subscriptions',
        timestamps: false,
        underscored: true,
    }
);

export { CustomerSubscriptionViewModel };
