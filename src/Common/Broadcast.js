import { qualityContUserDptUntView } from "../model/views/qualitycontrolView.model.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { UserModel } from "../model/user.model.js";
import { apiResponse } from "../utility/response.util.js";
import { VkQulityApprovalMngAdm } from "../model/views/QulityApprovalMngAdmView.model.js";
import { QualityControlModel } from "../model/qualityControl.model.js";
import { sequelize } from "../config/dbConfig.js";
import { OtherDepartmentViewModal } from "../model/views/otherDepartmentView.js";
const BroadcastMethod = {
    async fetchqualitycontrolbyvendorIdbroadcast(
        data,
        socket,
        io,
        currentRoute,
        id
    ) {
        try {
            let qualityControlResult = await qualityContUserDptUntView.findAll({
                order: [["created_on", "DESC"]],
                where: {
                    vendor_id: id,
                },
            });

            qualityControlResult = jsonFormator(qualityControlResult);

            let user = await UserModel.findOne({ where: { id: id } });
            user = jsonFormator(user);

            io.to(user.socket_id).emit("quality:fetchtablebyvendorId", {
                ...apiResponse.success(
                    true,
                    "quality control",
                    currentRoute,
                    qualityControlResult
                ),
            });
        } catch (error) {
            // console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },

    async allapprovalBroadcast(data, socket, io, currentRoute, id) {
        try {
            const approvaldetails = await VkQulityApprovalMngAdm.findAll({
                order: [[["created_on", "DESC"]]],
            });

            //   const alertCount = await VkQulityApprovalMngAdm.count();
            let QualityData = await QualityControlModel.findOne({
                where: { id: id },
            });
            QualityData = jsonFormator(QualityData);
            io.to(QualityData.created_by).emit("allapproval", {
                ...apiResponse.success(
                    true,
                    "product data",
                    currentRoute,
                    approvaldetails
                ),
            });
        } catch (error) {
            // console.error("error =>", error);

            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    async allapprovalBroadcastwithoutconditon(data, socket, io, currentRoute) {
        try {
            const approvaldetails = await VkQulityApprovalMngAdm.findAll({
                order: [[["created_on", "DESC"]]],
            });
            io.emit("allapproval", {
                ...apiResponse.success(
                    true,
                    "product data",
                    currentRoute,
                    approvaldetails
                ),
            });
        } catch (error) {
            // console.error("error =>", error);

            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },

    //   to broadcast updated data to sorurce , destination , approval manager , admin  after any change in approval status or new entry

    async broadcastToAllRequiredClients(data, socket, io, currentRoute, notToAdmin = false, otherDepartmentId = 0) {
        try {
            // console.log("broadcastToAllRequiredClients hited 💥");
            const { source = false, destination = false } = data;

            //   check wether view for destination and sorce department is created or not
            let [[isSourceViewExists]] = await sequelize.query(`SELECT * FROM Master_Tables WHERE table_name ='VK_${source}' AND type = 'V'`)

            console.log("source view details =>", isSourceViewExists);

            let [[isDestinationViewExists = false]] = await sequelize.query(`SELECT * FROM Master_Tables WHERE table_name ='VK_${destination}' AND type = 'V'`)
            console.log("destination view details =>", isDestinationViewExists)

            if (source && isSourceViewExists) {
                //  broad cast to the source
                const [sourceData] = await sequelize.query(
                    `SELECT * FROM VK_${source} order by created_on DESC`
                ); // for of the table / department  which has geneated this entry

                // emit for source department
                io.emit(source, {
                    ...apiResponse.success(true, "broadcast", currentRoute, sourceData),
                });
                console.log(`emit  source  ${source} 12/14`);
            }

            if (destination && isDestinationViewExists) {

                const [destinationData] = await sequelize.query(
                    `SELECT * FROM VK_${destination} order by created_on DESC`
                ); // for of the table / department for which the entry is genetated

                // emit for destination  department
                io.emit(destination, {
                    ...apiResponse.success(
                        true,
                        "broadcast",
                        currentRoute,
                        destinationData
                    ),
                });
                console.log(`emit destination  ${destination} 13/14`);
            }

            // plantmanagerControllers.allapproval(data, socket, io, "approval:all");

            // if you not want to send broad cast to the admin
            if (notToAdmin) {
                const [approvalsData] = await sequelize.query(
                    "SELECT * FROM Vk_QulityApprovalMngAdm ORDER BY created_on DESC"
                );

                io.emit("approval:all", {
                    ...apiResponse.success(true, "broadcast", currentRoute, approvalsData),
                });
            }

            // ************************************************************************
            // i you want to give broadcast to ther departmetns ( excluded fix departments for more refrence please visit "Master_Department" table )
            if (otherDepartmentId) {
                // fetch data afrom other department view 

                let result = await OtherDepartmentViewModal.findAll({
                    where: {
                        current_department_id: otherDepartmentId
                    }
                })

                io.emit(`Other_Department:${otherDepartmentId}`, { ...apiResponse.success(true, "broadcast ", currentRoute, result) })
            }
            console.log(`emit Approval all  ${source} 14/14`);
            // then boradcast to admin
            // then broad cast to approval manager
            // then broad cast to destination
            // TODO: broad cast to admin
        } catch (error) {
            console.log("ERRROR =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error?.message, currentRoute),
            });
        }
    },
};


export { BroadcastMethod };
