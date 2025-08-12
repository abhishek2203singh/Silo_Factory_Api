/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import cron from 'node-cron';
import moment from "moment";
import { VkSchedulerTimeUser } from "../model/views/schdulerTimeView.modal.js";
import { jsonFormator } from "../utility/toJson.util.js";
import { UserDetailView } from "../model/views/userView.model.js";
import { Op } from "sequelize";
import { CustomerSubscriptionModel } from "../model/dairyModels/customerSubscriptions.model.js";
import { DailyDeliverySchedulingModal } from "../model/dairyModels/dailyDeliveryScheduling.modal.js";
import { ProductModel } from "../model/product.model.js";
const Corn_schduler = {
    RegularSchduler() {
        cron.schedule('* * * * *', async () => {
            try {
                var NewDate = new Date();
                var cur = moment(NewDate).format('dddd');
                var today = moment(NewDate).format('YYYY-MM-DD')
                var Tomorrow_date = moment(NewDate.setDate(NewDate.getDate() + 1)).format('YYYY-MM-DD');
                var Today_day = moment(NewDate.setDate(NewDate.getDate() + 0)).format('dddd');
                console.log(`\nCurrent Day: ${cur}, Today: ${today}, Tomorrow: ${Tomorrow_date}, Tomorrow Day: ${Tomorrow_day}`);

                let Dstcenter = await VkSchedulerTimeUser.findAll({ where: { role_id: 12, department_id: 6, status: 1 } })
                Dstcenter = jsonFormator(Dstcenter);
                console.log("\nAll Dst Center:", Dstcenter);
                for (var i = 0; Dstcenter.length > i; i++) {
                    var Time = moment(new Date()).format('HH:mm');
                    console.log(Dstcenter[i].sti_schdule_time, Time);
                    // this.getallUsers(Dstcenter[i].id, Dstcenter[i].minimumschduleingbalance)
                    if (Dstcenter[i].sti_schdule_time == Time) {
                        this.getallUsers(Dstcenter[i].id, Dstcenter[i].minimumschduleingbalance)
                    }
                }
            } catch (error) {
                console.error("\n Schduler Corn Error: ", error)
            }

        })
    },


    async getallUsers(CenterId, mimBalance) {
        try {
            let users = await UserDetailView.findAll({ where: { dist_center_id: CenterId, available_balance: { [Op.gt]: mimBalance }, status: 1, sub_stop_date: null, role_id: 4, department_id: 6 } });
            users = jsonFormator(users);
            for (let i = 0; users.length > i; i++) {
                await this.getCustomerSubscriptions(users[i].id)
            }
            return;
        } catch (error) {
            console.log("\n getallUsers Schduler Corn Error: ", error);
            return;
        }
    },
    async getCustomerSubscriptions(id) {
        try {
            let subS = await CustomerSubscriptionModel.findAll({ where: { user_id: id, status: 1 } });
            subS = jsonFormator(subS);
            for (let i = 0; subS.length > i; i++) {
                let st = await this.getSchedulingStatus(subS[i]);
                if (st == true) {
                    this.setScheduling(subS[i]);
                }
            }
        } catch (error) {
            console.log("\n getCustomerSubscriptions Schduler Corn Error: ", error);
            return;
        }
    },

    async setScheduling(data) {
        try {
            var NewDate = new Date();
            var Today_day = moment(NewDate.setDate(NewDate.getDate() + 0)).format('dddd');
            var today = moment(NewDate).format('YYYY-MM-DD')
            let schedul = await DailyDeliverySchedulingModal.findAll({ where: { date: today, distribution_center_id: data.distribution_center_id, customer_id: data.user_id, customer_subscription_id: data.id, product_id: data.product_id } })
            schedul = jsonFormator(schedul);
            if (schedul.length > 0) {
                return;
            } else {
                let prod = await ProductModel.findOne({ where: { id: data.product_id } });
                prod = jsonFormator(prod);
                await DailyDeliverySchedulingModal.create({
                    distribution_center_id: data.distribution_center_id,
                    date: today,
                    customer_id: data.user_id,
                    customer_subscription_id: data.id,
                    shift: data.shift,
                    product_id: data.product_id,
                    delivery_boy_id: data.delivery_boy_id,
                    delivered_quantity: 0,
                    scheduled_quantity: data.quantity,
                    customer_price: data.user_price,
                    mrp: prod.mrp,
                    order_type: 1,
                    status: 1,
                    description: "Scheduling",
                    day: Today_day,
                    created_on: CURRENT_TIMESTAMP,

                })
                return;
            }

        } catch (error) {
            console.log("\n setScheduling Schduler Corn Error: ", error);
            return;
        }
    },

    async getSchedulingStatus(data) {
        try {
            var NewDate = new Date();
            var Tomorrow_day = moment(NewDate.setDate(NewDate.getDate() + 0)).format('dddd');

            if (data.all_day == 1) {
                return true;
            }

            if (alternate_day == 1) {

                if (data.sunday == 1 && Tomorrow_day == "Sunday") {
                    return true;
                }
                if (data.monday == 1 && Tomorrow_day == "Monday") {
                    return true;
                }
                if (data.tuesday == 1 && Tomorrow_day == "Tuesday") {
                    return true;
                }
                if (data.wednesday == 1 && Tomorrow_day == "Wednesday") {
                    return true;
                }
                if (data.thursday == 1 && Tomorrow_day == "Thursday") {
                    return true;
                }
                if (data.friday == 1 && Tomorrow_day == "Friday") {
                    return true;
                }
                if (data.saturday == 1 && Tomorrow_day == "Saturday") {
                    return true;
                }

                // ======================================================
                if (data.sunday == 0 && Tomorrow_day == "Sunday") {
                    return false;
                }
                if (data.monday == 0 && Tomorrow_day == "Monday") {
                    return false;
                }
                if (data.tuesday == 0 && Tomorrow_day == "Tuesday") {
                    return false;
                }
                if (data.wednesday == 0 && Tomorrow_day == "Wednesday") {
                    return false;
                }
                if (data.thursday == 0 && Tomorrow_day == "Thursday") {
                    return false;
                }
                if (data.friday == 0 && Tomorrow_day == "Friday") {
                    return false;
                }
                if (data.saturday == 0 && Tomorrow_day == "Saturday") {
                    return false;
                }
            }

            if (specific_day == 1) {
                if (data.sunday == 1 && Tomorrow_day == "Sunday") {
                    return true;
                }
                if (data.monday == 1 && Tomorrow_day == "Monday") {
                    return true;
                }
                if (data.tuesday == 1 && Tomorrow_day == "Tuesday") {
                    return true;
                }
                if (data.wednesday == 1 && Tomorrow_day == "Wednesday") {
                    return true;
                }
                if (data.thursday == 1 && Tomorrow_day == "Thursday") {
                    return true;
                }
                if (data.friday == 1 && Tomorrow_day == "Friday") {
                    return true;
                }
                if (data.saturday == 1 && Tomorrow_day == "Saturday") {
                    return true;
                }

                // ===================================================
                if (data.sunday == 0 && Tomorrow_day == "Sunday") {
                    return false;
                }
                if (data.monday == 0 && Tomorrow_day == "Monday") {
                    return false;
                }
                if (data.tuesday == 0 && Tomorrow_day == "Tuesday") {
                    return false;
                }
                if (data.wednesday == 0 && Tomorrow_day == "Wednesday") {
                    return false;
                }
                if (data.thursday == 0 && Tomorrow_day == "Thursday") {
                    return false;
                }
                if (data.friday == 0 && Tomorrow_day == "Friday") {
                    return false;
                }
                if (data.saturday == 0 && Tomorrow_day == "Saturday") {
                    return false;
                }
            }
        } catch (error) {
            console.log("\n getSchedulingStatus Schduler Corn Error: ", error);
            return false;
        }
    }
}
export { Corn_schduler };
