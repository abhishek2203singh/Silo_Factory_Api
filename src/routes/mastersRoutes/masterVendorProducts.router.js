import { masterVendorProductsControllers } from "../../controllers/index.controller.js";

function masterVendorProductsRoutes(io, socket) {

    // get all products of all vendors
    socket.on("ms-vender-product:all", (data) => {
        masterVendorProductsControllers.getAllProductsOfAllVendors(data, socket, io, "ms-vender-product:all")
    })

    // to assing a new product to the vendor 
    socket.on("ms-vender-product:assign", (data) => {
        masterVendorProductsControllers.assignProduct(data, socket, io, "ms-vender-product:assign")
    })

    // to update vendor product
    socket.on("ms-vender-product:update", (data) => {
        masterVendorProductsControllers.updateVendorProducts(data, socket, io, "ms-vender-product:update")
    })
    // get product types by vendor id
    socket.on("ms-vender-product:product-types", (data) => {
        masterVendorProductsControllers.getVendorProductTypesByVendorId(data, socket, io, "ms-vender-product:product-types")
    })

    // get product price according to vendor id product types and product id by vendor id
    socket.on("ms-vender-product:product-price", (data) => {
        masterVendorProductsControllers.getVendorProductPriceByVendorId(data, socket, io, "ms-vender-product:product-price")
    })

    // get all products assignded to the vendor 
    socket.on("ms-vender-product:products-by-vendor", (data) => {
        masterVendorProductsControllers.getAllVendorProducts(data, socket, io, "ms-vender-product:products-by-vendor")
    })
    // to delete vendor product
    socket.on("ms-vender-product:delete", (data) => {
        masterVendorProductsControllers.changeVendorProductStatus(data, socket, io, "ms-vender-product:delete")
    })
    // view vendor product by  id
    socket.on("ms-vender-product:by-id", (data) => {
        masterVendorProductsControllers.detailsById(data, socket, io, "ms-vender-product:by-id")
    })

    // to view all products of a perticular vendor 

    // view all products of all vendors

}


export default masterVendorProductsRoutes;