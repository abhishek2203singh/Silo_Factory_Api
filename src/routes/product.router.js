import { productControllers } from "../controllers/index.controller.js";

const productRouters = (io, socket) => {
  //   console.log("inside product router");
  // route for user registration
  socket.on("products:all", (data) => {
    // console.log("hitted =>");
    productControllers.getAllProduct(data, socket, io, "products:all");
  });
  socket.on("productsbyTypeId:all", (data) => {
    // console.log("hitted =>");
    productControllers.getProductByTypeId(data, socket, io, "productsbyTypeId:all");
  });
  socket.on("products:create", async (data) => {
    productControllers.insertProduct(data, socket, io, "products:create");
  });
  //   get product detail by product id
  socket.on("products:by-id", async (data) => {
    productControllers.getProductById(data, socket, io, "products:by-id");
  });

  socket.on("products:update", async (data) => {
    productControllers.updateProduct(data, socket, io, "products:update");
  });

  socket.on("products:by-product-type", async (data) => {
    productControllers.getProductsByProductTypeId(
      data,
      socket,
      io,
      "products:by-product-type"
    );
  });
};
export default productRouters;

// Import user routes and apply them to the socket.io server
