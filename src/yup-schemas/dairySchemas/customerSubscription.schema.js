import Yup from "yup";

const subscriptionSchema = Yup.object({
    allDay: Yup.boolean().default(false),
    alternateDay: Yup.boolean().default(false),
    specificDay: Yup.boolean().default(false),
    productId: Yup.number().min(28, "please select valid product").typeError("Please select valid product").required("please select product"),
    // packingSizeId: Yup.number().typeError("please select valid Packing size").required("Packing size is required"),
    quantity: Yup.number().typeError("please enter valid quantity").required("quantity is required").test(
        'is-integer',
        'invalid quantity please enter an intiger value like 1,5,3',
        (value) => Number.isInteger(value) // Checks if the number is an integer
    ),
    // userId: Yup.number().typeError("Please select a valid customer").min(1, "customer is not selected").required("customer is required"),
    deliveryBoyId: Yup.number().min(1, "please select valid delivery boy").required("please select a delivery boy"),
    userPrice: Yup.number().typeError("please select a valid price").default("price is required "),
    regularDay: Yup.boolean().default(false),
    shift: Yup.number().typeError("please select delivery shift").required("shift is required"),
    sunday: Yup.boolean().default(false),
    monday: Yup.boolean().default(false),
    tuesday: Yup.boolean().default(false),
    wednesday: Yup.boolean().default(false),
    thursday: Yup.boolean().default(false),
    friday: Yup.boolean().default(false),
    saturday: Yup.boolean().default(false),
})


export { subscriptionSchema }