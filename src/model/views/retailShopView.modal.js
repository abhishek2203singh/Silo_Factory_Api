import { DataTypes } from "sequelize";
import { sequelize } from "../../config/dbConfig.js";

const VKRetailShopDepartmentModal = sequelize.define(
    "VK_Retail_Shop_Department",
    {
        Id: { type: DataTypes.INTEGER, primaryKey: true },
        RetailId: { type: DataTypes.INTEGER },
        UserName: { type: DataTypes.STRING },
        EntryId: { type: DataTypes.INTEGER },
        entryTypeName: { type: DataTypes.STRING },
        date: { type: DataTypes.DATE },
        prodId: { type: DataTypes.INTEGER },
        productName: { type: DataTypes.STRING },
        prodTypeId: { type: DataTypes.INTEGER },
        ProdType: { type: DataTypes.STRING },
        weight_per_unit: { type: DataTypes.DECIMAL(11, 2) },
        priceper_unit: { type: DataTypes.DECIMAL(11, 2) },
        unitShortName: { type: DataTypes.STRING },
        quantity_st_name: { type: DataTypes.STRING },
        quantity_unit_name: { type: DataTypes.STRING },
        quantity: { type: DataTypes.DECIMAL(11, 2) },
        rejected_quantity: { type: DataTypes.DECIMAL(11, 2) },
        distributed_quantity: { type: DataTypes.DECIMAL(10, 0) },
        bill_image: { type: DataTypes.INTEGER },
        self_approval_datetime: { type: DataTypes.DATE },
        department_id: { type: DataTypes.INTEGER },
        departmentName: { type: DataTypes.STRING },
        distribution_center_id: { type: DataTypes.INTEGER },
        MasterDistributionCenter_Name: { type: DataTypes.STRING },
        status: { type: DataTypes.INTEGER },
        approval_status_by_destination: { type: DataTypes.INTEGER },
        destination_status: { type: DataTypes.INTEGER },
        self_approval_status_id: { type: DataTypes.INTEGER },
        destination_approval_datetime: { type: DataTypes.DATE },
        created_on: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        created_by: { type: DataTypes.INTEGER },
        updated_by: { type: DataTypes.INTEGER },
        updated_on: { type: DataTypes.DATE },
    },
    {
        tableName: "VK_Retail_Shop_Department",
        timestamps: false, // Disable Sequelize's automatic timestamp columns
        underscored: false, // Keep original field names from the view
        freezeTableName: true, // Prevent Sequelize from pluralizing the table name
    }
);

export { VKRetailShopDepartmentModal };
