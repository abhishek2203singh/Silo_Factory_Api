/* eslint-disable no-unused-vars */
import userRouters from "./user.router.js";
import productRouters from "./product.router.js";
// import unitRouters from "./unit.router.js";
import departmentRouters from "./department.router.js";
import menuRoutes from "./menu.router.js";
import vendorRouters from "./vendor.router.js";
import qualityControlRouter from "./qualitycontrol.router.js";
import vendorProductRouters from "./vendorproduct.router.js";
import roleRouter from "./role.router.js";
import locationRouter from "./location.router.js";
import alertRouter from "./alert.router.js";
import plantmanager from "./plantmanager.router.js";
import approvalRouter from "./approvals.router.js";
import masterDepartmentRouters from "./mastersRoutes/masterDepartment.router.js";
import masterSilosRouters from "./mastersRoutes/masterSilos.router.js";
import masterAlertRouters from "./mastersRoutes/masterAlert.router.js";
import masterRoleRouters from "./mastersRoutes/masterRole.router.js";
import silosRouters from "./silos.router.js";
import pasteurizationSiloRouter from "./pasteurizationSilo.router.js";
import masterPasteurizationSiloRouters from "./mastersRoutes/masterPasteurizationSilo.router.js";
import silosDepartmentRouters from "./silosDepartment.router.js";
import masterStateRouter from "./mastersRoutes/masterState.router.js";
import masterPaymentStatusRoute from "./mastersRoutes/masterPaymentStatus.router.js";
import pasteurizationDptRuters from "./pasteurizationDpt.router.js";
import masterApprovalStatusRouters from "./mastersRoutes/masterApprovalStatusType.router.js";
import masterCitiesRoute from "./mastersRoutes/masterCities.router.js";
import packingUnitRoute from "./mastersRoutes/masterPackingSize.router.js";
import masterUnitRouters from "./mastersRoutes/masterUnit.router.js";
import masterPaymentTyperoute from "./mastersRoutes/masterPaymentType.router.js";
import otherDepartmentRouters from "./otherDepartments.router.js";
import masterEntryTypeRouters from "./mastersRoutes/masterEntryType.router.js";
import masterStockRouters from "./mastersRoutes/masterStock.roter.js";
import stockDepartmentRouters from "./stockDepartment.router.js";
import PackagingDepartmentRouters from "./packagingDepartment.router.js";
import masterDistributionCenterRouters from "./mastersRoutes/masterDistributionCenter.router.js";
import adminRouters from "./admin.router.js";
import ecommerceDepartmentRouters from "./ecommerceDepartment.router.js";
import distributionCenterRoute from "./distributionCenter.router.js";
import stockInfoRouters from "./stockInfo.router.js";
import ecommerceUserRouters from "./ecommerceUser.router.js";
import packingProcessRouter from "./packingProcess.router.js";
import masterProductTypeRuter from "./mastersRoutes/masterProductType.router.js";
import retailShopRoute from './retailShop.router.js'
import deliveryBoyRoute from "./dairyRouters/deliveryBoy.router.js";
import customerRouters from "./dairyRouters/customer.router.js";
import unitRouters from "./unit.router.js";
import subscriptionRouters from "./dairyRouters/subscription.router.js";
import masterVendorProductsRoutes from "./mastersRoutes/masterVendorProducts.router.js";
import commonRouters from "./common.router.js";
import orderRouters from "./dairyRouters/order.router.js";
import inventoryRouter from "./inventory.router.js";
export default function (io, socket) {
    userRouters(io, socket);
    productRouters(io, socket);
    departmentRouters(io, socket);
    menuRoutes(io, socket);
    vendorRouters(io, socket);
    qualityControlRouter(io, socket);
    unitRouters(io, socket)
    vendorProductRouters(io, socket);
    roleRouter(io, socket);
    locationRouter(io, socket);
    alertRouter(io, socket);
    plantmanager(io, socket);
    approvalRouter(io, socket);
    silosRouters(io, socket);
    silosDepartmentRouters(io, socket);
    pasteurizationSiloRouter(io, socket);
    pasteurizationDptRuters(io, socket);
    otherDepartmentRouters(io, socket);
    stockDepartmentRouters(io, socket);
    PackagingDepartmentRouters(io, socket);
    adminRouters(io, socket);
    ecommerceDepartmentRouters(io, socket);
    distributionCenterRoute(io, socket);
    stockInfoRouters(io, socket);
    ecommerceUserRouters(io, socket);
    packingProcessRouter(io, socket);
    commonRouters(io, socket);
    inventoryRouter(io, socket);
    // Dairy Routers
    deliveryBoyRoute(io, socket);
    customerRouters(io, socket);
    subscriptionRouters(io, socket)
    orderRouters(io, socket)



    retailShopRoute(io, socket);

    //   for master
    packingUnitRoute(io, socket);
    masterUnitRouters(io, socket);
    masterAlertRouters(io, socket);
    masterRoleRouters(io, socket);
    masterDepartmentRouters(io, socket);
    masterSilosRouters(io, socket);
    // masterApprovalStatusRouters(io, socket);
    masterPasteurizationSiloRouters(io, socket);
    masterApprovalStatusRouters(io, socket);
    masterStateRouter(io, socket);
    masterPaymentStatusRoute(io, socket);
    masterCitiesRoute(io, socket);
    masterPaymentTyperoute(io, socket);
    masterEntryTypeRouters(io, socket);
    masterStockRouters(io, socket);
    masterDistributionCenterRouters(io, socket);
    masterProductTypeRuter(io, socket);
    masterVendorProductsRoutes(io, socket);
}
