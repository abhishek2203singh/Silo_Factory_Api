import { distributionCenterController } from '../controllers/index.controller.js';

function distributionCenterRoute(io, socket) {
    socket.on("distribution-dpt:add", (data) => {
        distributionCenterController.addDistributionData(data, socket, io, "distribution-dpt:add")
    });
    socket.on("distribution-dpt:return", (data) => {
        distributionCenterController.returnDistributionData(data, socket, io, "distribution-dpt:return")
    });
    socket.on("distribution-dpt:get", (data) => {
        distributionCenterController.getDistributionData(data, socket, io, "distribution-dpt:get")
    });
    socket.on("distribution-dpt:get-by-id", (data) => {
        distributionCenterController.getDistributionDataforViewById(data, socket, io, "distribution-dpt:get-by-id")
    });
    socket.on("distribution-dpt:get-byId", (data) => {
        distributionCenterController.getDistributionDataByid(data, socket, io, "distribution-dpt:get-byId")
    });
    socket.on("distribution-dpt:update", (data) => {
        distributionCenterController.updateData(data, socket, io, "distribution-dpt:update")
    });
    socket.on("distribution-dpt:send-stock", (data) => {
        distributionCenterController.sendRequestedStock(data, socket, io, "distribution-dpt:send-stock");
    });
    socket.on("distribution-dpt:delete-by-id", (data) => {
        distributionCenterController.deleteDistributionData(data, socket, io, "distribution-dpt:delete-by-id");
    });
    socket.on("distribution-dpt:accept", (data) => {
        distributionCenterController.acceptReturnData(data, socket, io, "distribution-dpt:accept")
    });
    socket.on("distribution-dpt:time-scheduler", (data) => {
        distributionCenterController.scheduleTime(data, socket, io, "distribution-dpt:time-scheduler")
    });
}
export default distributionCenterRoute;
