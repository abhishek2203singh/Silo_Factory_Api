import Yup from "yup";
import { apiResponse } from "../utility/response.util.js";
import { sequelize } from "../config/dbConfig.js";
import { VkQulityApprovalMngAdm } from "../model/views/QulityApprovalMngAdmView.model.js";
import { qualityContUserDptUntView } from "../model/views/qualitycontrolView.model.js";
import { VkInfoApprovalVkQualityApprovalMng } from "../model/views/infoApprovalView.model.js";
import { QualityApprovalManagerWithAdmin } from "../model/qualityApprovalMngAd.model.js";
import { InfoApprovals } from "../model/infoApproval.model.js";
import qualitycontrolcontroller from "./qualitycontrol.controller.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { customMessage } from "../utility/messages.util.js";
import { BroadcastMethod } from "../Common/Broadcast.js";
import { idSchema } from "../yup-schemas/idSchema.schema.js";
import { stausSchema } from "../yup-schemas/status.schema.js";
import { MasterDepartmentModel } from "../model/masterDepartment.model.js";
import Sequelize from "sequelize";
const approvalControllers = {
    // get all product in database
    async detailsapprovalbyId(data, socket, io, currentRoute) {
        try {
            // console.log("data =>", data);
            const { id = false } = data;
            //   console.log("id =>", id);
            if (!id || id < 1) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(true, customMessage.badReq, currentRoute),
                });
            }
            //   get approval details by id from [Quality_approval_manager_With_admin] table
            let approvaldetails = await VkQulityApprovalMngAdm.findAll({
                where: {
                    id: data.id,
                },
            });
            approvaldetails = jsonFormator(approvaldetails);
            console.log(approvaldetails);
            let approvalMultipaldetails =
                await VkInfoApprovalVkQualityApprovalMng.findAll({
                    where: {
                        qualityapproval_mang_id: data.id,
                    },
                    order: [["id", "DESC"]],
                });
            approvalMultipaldetails = jsonFormator(approvalMultipaldetails);
            //   console.log("query one result :", approvalMultipaldetails);
            //   console.table(approvaldetails);
            // find detail fo original reuest if current request's entry type ==7
            const isAdminReturn = approvaldetails[0].entry_type_id === 7 ? true : false;
            let previousRecord = null
            if (isAdminReturn) {
                console.log("approvaldetails[0].admin_table_ref_id =", approvaldetails[0].admin_table_ref_id)
                previousRecord = await VkQulityApprovalMngAdm.findByPk(approvaldetails[0].admin_table_ref_id)
                previousRecord = await jsonFormator(previousRecord)
                console.log("previousRecord =>", await previousRecord)
            }
            console.log("isAdminReturn:", isAdminReturn)
            let qualityControlResult = await qualityContUserDptUntView.findOne({
                where: {
                    id: approvaldetails[0].db_table_id,
                },
            });
            qualityControlResult = jsonFormator(qualityControlResult);
            //   console.log("query three result :", approvalMultipaldetails);
            socket.emit(currentRoute, {
                ...apiResponse.success(true, "product data", currentRoute, {
                    approvaldetails,
                    qualityControlResult,
                    previousRecord,
                    approvalMultipaldetails,
                }),
            });
        } catch (error) {
            // console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
    // to update entry status
    async insertupdateapproval(data, socket, io, currentRoute) {
        try {
            const approvalSchema = Yup.object({
                id: Yup.number(customMessage.badReq).required(customMessage.badReq),
                productname: Yup.string().required("product is required"),
                quantity: Yup.number().required(customMessage.badReq),
                statusid: Yup.number().required("status is required !"),
                message: Yup.string().required("message is required ")
            })
            // console.log("all models =>", sequelize.models);
            let {
                id,
                // eslint-disable-next-line no-unused-vars
                productname,
                quantity: approvedQuantity,
                statusid,
                message
            } = await approvalSchema.validate(data)
            console.log("data =>", data);
            // console.table("datahdkjds",data);
            if (!data.id) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.badReq, currentRoute),
                });
            }
            const transaction = await sequelize.transaction();
            try {
                //  get enty by id and status to insure that entry / transaction status is not false (deleted)
                let approval = await VkQulityApprovalMngAdm.findOne(
                    {
                        where: { id: data.id, status: true },
                    },
                );
                // console.log("find approval details  => 1/14");
                approval = jsonFormator(approval);
                // fetch deaptment detals 
                let otherDepartId = 0;
                // to store the id of the destinatio department if the destinatio department is one of other department
                let isDestinationOtherDpt = 0
                const destinationDepartmentDetails = jsonFormator(await MasterDepartmentModel.findByPk(approval?.send_department_id));
                if (destinationDepartmentDetails.table_name == "Other_Department") {
                    isDestinationOtherDpt = destinationDepartmentDetails?.id;
                }
                // to findout the id of the current department which have generate this request/ entry
                let departmentDetails = jsonFormator(await MasterDepartmentModel.findByPk(approval.in_department_id));
                if (departmentDetails.table_name == "Other_Department") {
                    otherDepartId = departmentDetails.id;
                }
                console.log({ approval });
                // console.log("approval details =>", approval);
                // return;
                // if the approved quantity is defferent then actial quantity 
                approvedQuantity = Number(approvedQuantity)
                console.log("approved quantity=>", approvedQuantity)
                // if approved quantity is 0 the return 
                if (approvedQuantity == 0 && approvedQuantity < 0 && statusid == 3) {
                    await transaction.rollback();
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, "Quantity should not be zero or negative", currentRoute),
                    });
                }
                // if approval is not exists
                if (!approval) {
                    await transaction.rollback();
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(
                            false,
                            "Deleted By Department OR " + customMessage.notEx
                        ),
                    });
                }
                // check  wether entry is already approved then it can't be changed
                if (approval?.approval_status_id == 3) {
                    await transaction.rollback();
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, "Already Approved", currentRoute),
                    });
                }
                const orginalQuantity = await Number(approval.quantity)
                const rejectedQuantity = await Number(orginalQuantity - approvedQuantity)
                console.log("rejected quantity =>>", rejectedQuantity);
                console.log("details =>", { //     original_quantity: orginalQuantity,
                    approved_quanity: approvedQuantity,
                    rejected_quantity: rejectedQuantity,
                    orginalQuantity,
                    isEqual: approvedQuantity === orginalQuantity
                })
                // return
                //   insert data in  approvals_info table
                let infoApprovalCreate = await InfoApprovals.create(
                    {
                        // qualityapproval_mang_id: data.id, //TODO: previous
                        qualityapproval_mang_id: data.id,
                        approval_by: socket.user.id,
                        mstapprovalstatus_id: data.statusid,
                        message_val: data.message,
                        original_quantity: orginalQuantity,
                        approved_quanity: approvedQuantity,
                        rejected_quantity: rejectedQuantity,
                        created_by: socket.user.id,
                    },
                    { transaction }
                );
                if (!infoApprovalCreate) {
                    throw new Error("Error while inserting in approval_info table");
                }
                console.log("insert data in approval table  => 2/14");
                // if approved quantity is greater than original quantity
                if (approvedQuantity > orginalQuantity && statusid == 3) {
                    await transaction.rollback();
                    return socket.emit(currentRoute, {
                        ...apiResponse.error(false, "Approved quantity must not be greater than original quantity " + orginalQuantity, currentRoute),
                    });
                }
                //  if approved quanity is less than total(sended quantity) then the remaining quantity will be sended back to the source
                if (approvedQuantity !== orginalQuantity && (statusid == 3 || statusid)) { //if quantity is rejected then the full quantity shuld be returned
                    console.log(`approved quantity ${approvedQuantity} is less than total ${orginalQuantity} => 2(i)/14`)
                    // find out tables upcoming id
                    const nextId = await QualityApprovalManagerWithAdmin.max("id") + 1;
                    // insert data in Quality_approval_manager_With_admin
                    let adminTableInsetResult = await QualityApprovalManagerWithAdmin.create({
                        db_table_id: nextId,
                        product_id: approval.product_id,
                        ms_product_type_id: approval?.ms_product_type_id,
                        quantity: parseFloat(orginalQuantity).toFixed(2),
                        rejected_quantity: parseFloat(rejectedQuantity).toFixed(2),
                        master_packing_size_id: approval?.master_packing_size_id,
                        approval_status_id: 3,//approved
                        approval_status_by_destination: 1,
                        approval_datetime: Sequelize.fn('CURRENT_TIMESTAMP'),
                        priceper_unit: approval?.priceper_unit ?? 0.00,
                        unit_id: approval?.unit_id,
                        vendor_id: approval?.vendor_id,
                        db_table_name: "Quality_approval_manager_With_admin",
                        admin_table_ref_id: id,
                        entry_type_id: 7,  // for admin return ,
                        in_departmenthead_id: 1,//for admin
                        in_department_id: 10,//for management departmetn
                        send_db_table_name: approval?.db_table_name,
                        send_department_id: approval?.in_department_id,
                        send_departmenthead_id: approval?.in_departmenthead_id,
                        approval_by: socket.user.id,
                        dist_center_id: approval.dist_center_id ?? null,
                        status: true,
                        created_by: socket.user.id,
                        message: message,
                    }, { transaction })
                    if (!adminTableInsetResult) {
                        throw new Error("Failed to insert returned quantity in admin table");
                    }
                    adminTableInsetResult = jsonFormator(adminTableInsetResult);
                    console.log(`Rejected  quantity ${rejectedQuantity} successfully in admin tabe with id [${adminTableInsetResult.id}] => 2(ii)/14`)
                    // if entry type is request then upadate the "rejected_quantity" in source table otherwise make new entry in source table
                    // if entry_type_id ==2  means request 
                    if (approval.entry_type_id == 2) {
                        console.log(`entry TYPE id ( ${approval.entry_type_id}/ Request ) => 2(iii)/14`)
                        // fetch current data from source table to update rejected quantity
                        const sourceTableDataBeforeUpdate = await sequelize.models[approval.db_table_name].findByPk(approval.db_table_id);
                        if (!sourceTableDataBeforeUpdate) {
                            throw new Error("source data not found to update rejected quantity => 2(iv)/14 ")
                        }
                        console.log(`fetched source table ${approval.db_table_name} to update rejected quantity => 2(iv)/14`)
                        let sourceTableData = sourceTableDataBeforeUpdate;
                        // udate rejected quantity
                        await sourceTableData.update({ rejected_quantity: rejectedQuantity }, { transaction });
                        // data in source table after update 
                        let sourceTableDataAfterUpdate = await sourceTableData.save();
                        sourceTableDataAfterUpdate = jsonFormator(sourceTableDataAfterUpdate)
                        console.log("source table update result =>", sourceTableDataAfterUpdate)
                        if (!sourceTableDataAfterUpdate) {
                            throw new Error("Failed to update rejected quantity in source table => 2(v)/14 ");
                        }
                        console.log(` rejectd quantity is updated successfully in tabel ${approval.db_table_name} to update rejected quantity => 2(v)/14`);
                        const dataForSourceUpdate = jsonFormator(sourceTableDataBeforeUpdate);
                        const refId = dataForSourceUpdate.id;
                        delete dataForSourceUpdate.id;
                        console.log("source table data after delete id  =>> ", dataForSourceUpdate)
                        let sourceUpdateTableResult = await sequelize.models[approval.db_table_name + "_Update"].create({
                            ...dataForSourceUpdate,
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            date: String(sequelize.literal("CURRENT_TIMESTAMP")),
                            created_by: socket.user.id,
                            updated_by: socket.user.id,
                            status: true,
                            activity: "admin return / update",
                            ref_table_id: refId
                        }, { transaction })
                        if (!sourceUpdateTableResult) {
                            throw new Error("Failed to insert rejectd quantit in source update table")
                        }
                        sourceUpdateTableResult = jsonFormator(sourceUpdateTableResult);
                        console.log(`rejected quantity data is inserted successfully in  ${approval.db_table_name}_Update table with id (${sourceUpdateTableResult.id}) => 2(vi)/14`);
                        // await transaction.rollback();
                        // return
                    }
                    else {
                        console.log(`rejectd quantity update skipped[2(iii)=>> 2(vi)] because entry type id (${approval.entry_type_id})`);
                        const adminTableId = adminTableInsetResult.id;
                        delete adminTableInsetResult.id;
                        if (!adminTableId) {
                            throw new Error("ADMIN table id is required");
                        }
                        // send remaining quantity back to the source department
                        let rejectedQuantitySendResult = await sequelize.models[approval.db_table_name].create({
                            ...adminTableInsetResult,
                            department_id: adminTableInsetResult?.in_department_id,
                            approval_status_by_destination: 1,
                            quantity: rejectedQuantity,
                            distributed_quantity: 0,
                            admin_table_id: adminTableId,
                            db_table_id: adminTableId,
                            departmenthead_id: adminTableInsetResult.in_departmenthead_id,
                            with_approval: true,
                            self_approval_status_id: 1,
                            self_approval_datetime: null,
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                        }, { transaction })
                        if (!rejectedQuantitySendResult) {
                            throw new Error("error while returning the remaining quantity ")
                        }
                        rejectedQuantitySendResult = jsonFormator(rejectedQuantitySendResult)
                        console.log(`New entry for rejected quantity is inserted in table  '${approval.db_table_name}' with id =(${rejectedQuantitySendResult.id}) => 2(vii)/14`)
                        // remove id of inserted result
                        const refId = rejectedQuantitySendResult.id;
                        delete rejectedQuantitySendResult.id;
                        // insert data in update table of source table
                        let returnResultOfUpdateTable = await sequelize.models[approval.db_table_name + "_Update"].create({
                            ...rejectedQuantitySendResult,
                            activity: "Admin Return / Create ",
                            ref_table_id: refId,
                            date: sequelize.literal("CURRENT_TIMESTAMP"),
                            created_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            updated_on: sequelize.literal("CURRENT_TIMESTAMP"),
                            created_by: socket.user.id,
                        }, { transaction })
                        // if any error while inserting in update table
                        if (!returnResultOfUpdateTable) {
                            throw new Error("Error while updating update table of  ", approval.send_db_table_name + "_Update");
                        }
                        returnResultOfUpdateTable = jsonFormator(returnResultOfUpdateTable);
                        console.log(`data inserted in update table with id  (${returnResultOfUpdateTable.id})  => 2(viii)/14`);
                    }
                    console.log(`rejected quantity insert is skipped 2(v11) =>> 2(viii)`);
                } //if end
                // update data in (Quality_approval_manager_With_admin) table
                let [updateQualityapprovalMngAdmin] =
                    await QualityApprovalManagerWithAdmin.update(
                        {
                            approval_status_id: parseInt(data.statusid),
                            approval_by: socket.user.id,
                            approval_datetime: new Date(),
                            updated_by: socket.user.id,
                            message
                        },
                        {
                            where: { id: data.id },
                            transaction,
                        }
                    );
                if (!updateQualityapprovalMngAdmin) {
                    throw new Error("Error while updating in admin approval table");
                }
                console.log(" update data in updateQualityapprovalMngAdmin => 3/14");
                // TODO: also check the current status of entry if status is false then not process the entry
                //  console.log("\n\n\n\nTable Name ", approval.db_table_name);
                // data in source table before approval 
                const [[sourceTableOldData = false]] = await sequelize.query(
                    `SELECT * from  ${approval.db_table_name} where id = ${approval.db_table_id} and status = ${true}`,
                    { transaction }
                );
                console.log("data in source table before update  =>", sourceTableOldData)
                if (!sourceTableOldData) {
                    await transaction.rollback();
                    socket.emit(currentRoute, { ...apiResponse.error(false, "source details " + customMessage.notFound, currentRoute) })
                    return
                }
                console.log(
                    `find data in source table : ${approval.db_table_name} => 4/14`
                );
                // console.log("oldSorceTableData =>", sourceTableOldData);
                // update the status in source table (from where the entry is generated )
                const [updateInSourceTable] = await sequelize.query(
                    `update ${approval.db_table_name} set approval_status_id = ${data.statusid},admin_table_id =${data.id},approval_by = ${socket.user.id}, approval_datetime = CURRENT_TIMESTAMP(), updated_by = ${socket.user.id}, updated_on = CURRENT_TIMESTAMP() where id = ${approval.db_table_id} `,
                    { transaction }
                );
                if (updateInSourceTable?.length > 0) {
                    throw new Error("Error while updting source table");
                }
                console.log(
                    ` update data in source table  : ${approval.db_table_name} => 5/14`
                );
                // find entry in the source table (from where the entry is generated ) after update
                const [[dataInSourceTableAfterUpdate = null]] =
                    await sequelize.query(
                        `select * from ${approval.db_table_name} where id = ${approval.db_table_id} and status=true`,
                        { transaction }
                    );
                console.log("data after update in source table =>",)
                if (dataInSourceTableAfterUpdate?.length === 0 || dataInSourceTableAfterUpdate == null) {
                    throw new Error("Error Entry does not exists", dataInSourceTableAfterUpdate);
                }
                console.log("data in source table after update =>", dataInSourceTableAfterUpdate)
                console.log(
                    `find data in source table : ${approval.db_table_name} after status update =>6/14`
                );
                // is source table is stock table
                const isStockTable =
                    approval.db_table_name == "Stock_Department" ? true : false;
                // insert the current data of original table(source table)  into the update table (duplicate of original table)
                const [insertInSourceUpdateTable] = await sequelize.query(
                    `insert into ${approval.db_table_name
                    }_Update(ref_table_id, date, vendor_id, product_id, quantity, unit_id,${isStockTable ? "selling_price" : "priceper_unit"
                    } , department_id, departmenthead_id, approval_status_id, approval_by, approval_datetime, bill_image, created_by, activity,approval_status_by_destination,ms_product_type_id,master_packing_size_id,self_approval_status_id,self_approval_datetime,destination_approval_datetime, admin_table_id) values(${dataInSourceTableAfterUpdate?.id
                    }, CURRENT_TIMESTAMP(), ${dataInSourceTableAfterUpdate?.vendor_id ?? 0
                    }, ${dataInSourceTableAfterUpdate?.product_id}, ${dataInSourceTableAfterUpdate?.quantity
                    }, ${dataInSourceTableAfterUpdate?.unit_id}, ${isStockTable
                        ? dataInSourceTableAfterUpdate?.selling_price // to handle selling_price colum in (Stock_Department) table
                        : dataInSourceTableAfterUpdate?.priceper_unit ?? 0.0
                    }, ${dataInSourceTableAfterUpdate?.department_id}, ${dataInSourceTableAfterUpdate?.departmenthead_id
                    }, ${data?.statusid}, ${socket?.user?.id}, CURRENT_TIMESTAMP(), '${dataInSourceTableAfterUpdate?.bill_image ?? null
                    }', ${socket?.user?.id}, "UPDATE",${approval?.approval_status_by_destination
                    },${approval?.ms_product_type_id},${approval?.master_packing_size_id ?? 0
                    } ,${approval?.self_approval_status_id},${approval?.self_approval_datetime
                    },${approval?.destination_approval_datetime},${data?.id} )`,
                    { transaction }
                );
                //  console.log("insertInSourceUpdateTable =>", insertInSourceUpdateTable);
                if (!insertInSourceUpdateTable) {
                    throw new Error(
                        "Error while inserting in insertInSourceUpdateTable table"
                    );
                }
                console.log(
                    `insert data in source table's update table ${approval.db_table_name}_Update => 7/14`
                );
                // *********************************************************************************************
                // to check wether if entry type is ==2 then this is an request type entry it means the destination department have to sent milk / product to requsted repartment
                // if entry type =4 then it means the source department sent any product to destination department
                // *********************************************************************************************
                // TODO: logic for re approval if (approval rejected approval)
                //   check if old status was approved and now again want to approve aganin
                // if (dataInSourceTableAfterUpdate?.appr)
                //   first check if this entry already exists in the source table (in case if entry was first apprved then rejected then again approved and rejected so on )
                const [[isEntryExistesInDestinationTable]] = await sequelize.query(
                    `SELECT * FROM ${approval.send_db_table_name} WHERE admin_table_id=${data.id}`
                );
                console.log(
                    `check is entry already exists in  destination table :${approval.send_db_table_name} => 8/14`,
                    "found =>",
                    Boolean(isEntryExistesInDestinationTable)
                );
                let entryTypeForDestinationTable = 0;
                // if entry is not exitst in destination table and admin/ plant manager want to apporove
                if (data.statusid == 3 && !isEntryExistesInDestinationTable) {
                    // if entry approved then insert data in destination table
                    //here approval_status_id ==3 represents the approved . for more detail check [Master_ApprovalStatus] table
                    //   if entry generated from [Quality_Control] it means this is an stock entry  for this entry_type_id will be 3
                    if (approval.db_table_name == "Quality_Control") {
                        // this will be stock in always
                        entryTypeForDestinationTable = 3;
                    }
                    if (dataInSourceTableAfterUpdate?.entry_type_id == 3) {
                        // if there is an (stock IN) entry then it will remain same
                        entryTypeForDestinationTable = 3;
                    }
                    if (dataInSourceTableAfterUpdate?.entry_type_id == 4) {
                        // in etry type was 4 means this is a an out entry then it will converyted to (stock In) for destination table
                        // EX. assume that silo_department want to sent 500lrl milk directly to pasteurization departmt then the silo_department will create aentry with entry_type_id=4
                        entryTypeForDestinationTable = 3;
                        console.error("entry type 4 set =>.", entryTypeForDestinationTable);
                    }
                    //   if (dataInSourceTableAfterUpdate?.entry_type_id == 1) {
                    //     // in case of demand the depamd  also will be converted into stock In
                    //     entryTypeForDestinationTable = 3;
                    //   }
                    else {
                        // in other case the entry remains same for destination table
                        entryTypeForDestinationTable =
                            dataInSourceTableAfterUpdate?.entry_type_id ?? 3;
                    }
                    // TODO handle speacial case for ecommerce users
                    console.log("entry type =>", {
                        destination: entryTypeForDestinationTable,
                        source: dataInSourceTableAfterUpdate.entry_type_id,
                    });
                    //  =dataInSourceTableAfterUpdate?.entry_type_id===3?
                    //   if entry is approved then the exacat same entry will be added in source table woth updated entry_type_id
                    let dataToInsertInDestinationTable = {
                        entry_type_id: entryTypeForDestinationTable,
                        approval_status_by_destination: 1,
                        date: sequelize.literal("CURRENT_TIMESTAMP()"),
                        product_id: dataInSourceTableAfterUpdate.product_id,
                        quantity: approvedQuantity,
                        unit_id: dataInSourceTableAfterUpdate.unit_id,
                        db_table_name: approval.db_table_name,
                        db_table_id: approval.db_table_id,
                        created_by: socket.user.id,
                        with_approval: 1,
                        approval_by: socket.user.id,
                        approval_status_id: data.statusid,
                        admin_table_id: data?.id,
                        department_id: approval.in_department_id,
                        departmenthead_id: approval.in_departmenthead_id,
                        ms_product_type_id: approval?.ms_product_type_id,
                        master_packing_size_id: approval?.master_packing_size_id ?? 0,
                        approval_datetime: sequelize.literal("CURRENT_TIMESTAMP()"),
                    }
                    // if the destination department is other department then also insdet the id of department from where the entry was originally generated
                    if (isDestinationOtherDpt) {
                        dataToInsertInDestinationTable = { ...dataToInsertInDestinationTable, current_department_id: approval?.in_department_id }
                    }
                    // check wether the destination department is distribution center
                    if (approval.send_db_table_name == "DistributionCenter_Department") {
                        dataToInsertInDestinationTable = {
                            ...dataToInsertInDestinationTable, dist_center_id: approval?.dist_center_id,
                        }
                    }
                    console.log({
                        dataToInsertInDestinationTable
                    })
                    if (approval.send_db_table_name == "Stock_Department") {
                        console.log("is stock department =>>", approval?.send_db_table_name)
                        dataToInsertInDestinationTable = { ...dataToInsertInDestinationTable, dist_center_id: approval?.dist_center_id }
                    }
                    console.table(dataToInsertInDestinationTable)
                    const insertInDestiantionTable = jsonFormator(await sequelize.models[approval?.send_db_table_name].create({
                        ...dataToInsertInDestinationTable,
                    }, { transaction }))
                    if (!insertInDestiantionTable) {
                        throw new Error("Error while inserting in destination table");
                    }
                    console.log(
                        `insert data in destination table : ${approval?.send_db_table_name} => 9/14`
                    );
                    console.log(` inserted data in destination table : ${approval?.send_db_table_name} :`, insertInDestiantionTable)
                    const refId = insertInDestiantionTable.id;
                    delete insertInDestiantionTable.id
                    const insertInDestinationUpdateTable = jsonFormator(
                        await sequelize.models[approval.send_db_table_name + "_Update"].create(
                            {
                                ...insertInDestiantionTable,
                                ref_table_id: refId,
                                created_by: socket.user.id,
                                activity: "update",
                                created_on: sequelize.literal("CURRENT_TIMESTAMP")
                            }
                        )
                    )
                    console.log(
                        "destination update insert result =>",
                        insertInDestinationUpdateTable
                    );
                    if (!insertInDestinationUpdateTable) {
                        throw new Error(
                            "Error while inserting in destination update table"
                        );
                    }
                    console.log(
                        `insert data in destination update table : ${approval.send_db_table_name} => 10/15`
                    );
                }
                isEntryExistesInDestinationTable &&
                    console.log(
                        `insert data in destination table skiped because entry exists : ${approval.send_db_table_name} ,id == :${isEntryExistesInDestinationTable.id}  => 9/14`
                    );
                //   if entry was approved earlier now the ( admin/plant manager ) want to change status other than approved
                if (
                    (sourceTableOldData?.approval_status_id == 3 &&
                        data?.statusid != 3) ||
                    isEntryExistesInDestinationTable
                ) {
                    const [updateDestinationTable] = await sequelize.query(
                        `update ${approval.send_db_table_name} set approval_status_id = ${data.statusid}, approval_by = ${socket.user.id}, approval_datetime = CURRENT_TIMESTAMP(), updated_by = ${socket.user.id}, updated_on = CURRENT_TIMESTAMP() where db_table_id = ${approval.db_table_id} AND admin_table_id =${data.id}`,
                        { transaction }
                    );
                    if (!updateDestinationTable) {
                        throw new Error("Error while updating destination table");
                    }
                }
                await transaction.commit();
                console.log("commit => 11/14");
                socket.emit(currentRoute, {
                    ...apiResponse.success(true, customMessage.updSucc),
                    currentRoute,
                });
                const broadCastData = {
                    source: approval.db_table_name,
                    destination: approval.send_db_table_name,
                };
                // to update current data at  all respective clients (departments);
                await BroadcastMethod.broadcastToAllRequiredClients(
                    broadCastData,
                    socket,
                    io,
                    "allapproval", false, otherDepartId
                );
                await qualitycontrolcontroller.fetchqualitycontrolbyLoggedInUser(
                    data,
                    socket,
                    io,
                    "listen:" + approval.db_table_name
                );
                this.detailsapprovalbyId(
                    { id: data.id },
                    socket,
                    io,
                    "approval:detailsbyid"
                );
                // TODO: refresh page of source (the person which has generated this entry )
                // socket.emit(currentRoute, {
                //   ...apiResponse.success(
                //     true,
                //     "Approval list data",
                //     currentRoute,
                //     approval
                //   ),
                // });
            }
            catch (error) {
                await transaction.rollback();
                console.error("ERROR = >>>>> :", error);
                socket.emit(currentRoute, {
                    ...apiResponse.error(
                        false,
                        customMessage.wentWrong + " while performing approval opera"
                    ),
                });
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            //  console.error("error =>", error);
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    }
    ,
    //   to change approval_status by destination department
    async updateApprovalStatusByDestination(data, socket, io, currentRoute) {
        try {
            const schema = stausSchema.concat(idSchema);
            const { id, status } = await schema.validate(data);
            // find current user department id
            const currentDptId = socket.user.department_id
            console.log("current department id: " + currentDptId)
            let departmentDetail = await MasterDepartmentModel.findByPk(
                currentDptId
            );
            console.log("get department detail by login user => 1/");
            if (departmentDetail) {
                console.log("department details =>", departmentDetail)
            }
            //   const { table_name } = jsonFormator(departmentDetail);
            departmentDetail = jsonFormator(departmentDetail);
            console.log(departmentDetail);
            const [[{ admin_table_id = false }]] = await sequelize.query(
                `SELECT admin_table_id  FROM ${departmentDetail.table_name} where id = ${id}`
            );
            if (!admin_table_id) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, customMessage.invalidReq, currentRoute),
                });
            }
            console.log("admin_table_id =>", admin_table_id)
            console.log("find admin table id from current table   => 2/");
            const transaction = await sequelize.transaction();
            try {
                // find entry details in admin approval table
                const entryDetails = await QualityApprovalManagerWithAdmin.findByPk(
                    admin_table_id,
                    { transaction }
                );
                if (!entryDetails) {
                    throw new Error(
                        "Error while finding entry in admin approval table"
                    );
                }
                console.log("entryDetails =>", entryDetails)
                const { db_table_name: sourceTableName } = jsonFormator(entryDetails);
                console.log("find details in admin table using id => 3/");
                //   update status in admin approval table
                const updateStatusInAdminTable =
                    await QualityApprovalManagerWithAdmin.update(
                        {
                            approval_status_by_destination: status,
                            destination_approval_datetime: Sequelize.NOW(),
                        },
                        {
                            where: {
                                id: admin_table_id,
                            },
                            transaction,
                        }
                    );
                if (!updateStatusInAdminTable) {
                    throw new Error(
                        "Error while updating approval status in admin table"
                    );
                }
                console.log("updated status in admin table  => 4/");
                // **************************************************************************
                //find details in sorce table (from where the entry was originally generated Ex=> the Pasteurization_Department departmet has send a request to silo Dpt then the Pasteurization_Department will be treaed as source department )
                const [updateInSourceTable] = await sequelize.query(
                    `update ${sourceTableName} set approval_status_by_destination = ${status}, destination_approval_datetime = CURRENT_TIMESTAMP() where admin_table_id=${admin_table_id}`, { transaction }
                );
                console.log("source table data =>", updateInSourceTable);
                if (!updateInSourceTable) {
                    throw new Error("Error while finding entry in source table");
                }
                console.log(`updated status in source table [${sourceTableName}] => 5/`);
                // updat status in destintable
                const [updateStatusInDestinationTable] = await sequelize.query(
                    `UPDATE ${departmentDetail.table_name} set self_approval_status_id = ${status}, self_approval_datetime = CURRENT_TIMESTAMP()  where admin_table_id=${admin_table_id}`, { transaction }
                );
                const destinationTableName = departmentDetail.table_name;
                if (updateStatusInDestinationTable.length == 0) {
                    throw new Error("while updating status in destination table");
                }
                console.log(`updated status in destination table  [${departmentDetail.table_name}]=>`, updateStatusInDestinationTable);
                console.log(`updated status in current table [${departmentDetail.table_name}]  =>6 /`);
                await transaction.commit();
                socket.emit(currentRoute, {
                    ...apiResponse.success(
                        true,
                        "status " + customMessage.updSucc,
                        currentRoute
                    ),
                    currentRoute,
                });
                console.log("reached till broad cast")
                // broad cast 
                // const { source = false, destination = false } = data;
                BroadcastMethod.broadcastToAllRequiredClients({ source: sourceTableName, destination: destinationTableName }, socket, io, currentRoute)
            } catch (error) {
                console.log("Error =>", error)
                await transaction.rollback();
                socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            // find entry in department detail of current department
            // find admin table id
            // update approval_status_by_destination  in admin table
            // update approval_status_by_destination  in source table
            // update approval_status_by_destination in destiantion table
        } catch (error) {
            console.log("Error =>", error)
            if (error instanceof Yup.ValidationError) {
                return socket.emit(currentRoute, {
                    ...apiResponse.error(false, error.message, currentRoute, error),
                });
            }
            socket.emit("error", {
                ...apiResponse.error(false, error.message, currentRoute, error),
            });
        }
    },
};
export default approvalControllers;

