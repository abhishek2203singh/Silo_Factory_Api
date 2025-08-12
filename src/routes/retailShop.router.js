import { retailShopController } from '../controllers/index.controller.js';
const retailShopRoute = (io, socket) => {
    socket.on("retail-dpt:add-entry", (data) => {
        retailShopController.addEntry(data, socket, io, "retail-dpt:add-entry")
    });
    socket.on("retail-dpt:get-by-id", (data) => {
        retailShopController.getDataById(data, socket, io, "retail-dpt:get-by-id")
    });
    socket.on("retail-dpt:all", (data) => {
        retailShopController.getAllData(data, socket, io, "retail-dpt:all")
    });
    socket.on("retail-dpt:update-status", (data) => {
        retailShopController.updateRetailData(data, socket, io, "retail-dpt:update-status")
    });
    socket.on("retail-dpt:accept-stock",(data)=>{
        retailShopController.acceptStock(data,socket,io,"retail-dpt:accept-stock")
    });
    socket.on("retail-dpt:return-stock",(data)=>{
        retailShopController.returnStock(data,socket,io,"retail-dpt:return-stock")
    });
   
}
export default retailShopRoute;