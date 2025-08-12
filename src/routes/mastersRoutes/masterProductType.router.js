import masterProductTypeControllers from "../../controllers/masterControllers/masterProductType.controller.js";

function masterProductTypeRuter(io, socket) {
    // to create new product type
    socket.on("ms-product-type:create", (data) => {
        masterProductTypeControllers.createProductType(
            data,
            socket,
            io,
            "ms-product-type:create"
        );
    });

    //   update product type
    socket.on("ms-product-type:update", (data) => {
        masterProductTypeControllers.updateProductType(
            data,
            socket,
            io,
            "ms-product-type:update"
        );
    });
    //   get product type by id
    socket.on("ms-product-type:by-id", (data) => {
        masterProductTypeControllers.getProductTypeById(
            data,
            socket,
            io,
            "ms-product-type:by-id"
        );
    });

    socket.on("ms-product-type:delete", (data) => {
        masterProductTypeControllers.deleteProductType(
            data,
            socket,
            io,
            "ms-product-type:delete"
        );
    });

    socket.on("ms-product-type:all", (data) => {
        masterProductTypeControllers.getAllProductTypes(
            data,
            socket,
            io,
            "ms-product-type:all"
        );
    });
}

export default masterProductTypeRuter;
