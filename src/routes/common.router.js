import commonControllers from "../controllers/common.controller.js"

function commonRouters(io, socket) {
    socket.on("common:admin-return-details", (data) => {
        commonControllers.adminReturnDetails(data, socket, io, "common:admin-return-details")
    })
}

export default commonRouters;