import { packingProcessControllers } from "../controllers/index.controller.js";

packingProcessControllers;
function packingProcessRouter(io, socket) {
    socket.on("packing-process:start", (data) => {
        console.log(data);
        packingProcessControllers.startPacking(
            data,
            socket,
            io,
            "packing-process:start"
        );
    });

    // packing process finished         
    socket.on("packing-process:finish", (data) => {
        console.log(data);
        packingProcessControllers.
            finishPacking(
                data,
                socket,
                io,
                "packing-process:finish"
            );
    });

    //   view all packing process
    socket.on("packing-process:all", (data) => {
        console.log(data);
        packingProcessControllers.getAllPackingProcesses(
            data,
            socket,
            io,
            "packing-process:all"
        );
    });
}

export default packingProcessRouter;
