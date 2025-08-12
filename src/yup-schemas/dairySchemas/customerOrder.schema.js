import Yup from 'yup'

const oderSchema = Yup.object({
    deliveryDate: Yup.date()
        .required('Order date is required')
        .typeError('Invalid date format')
        .min(new Date(), 'Delivery date cannot be in the past').default(new Date()),
    productId: Yup.number().typeError("Invalid product selected").required("please select a product "),
    quantity: Yup.number().typeError("Invalid quantity").min(0.1, "Quantity should be greater than 1").required("please enter quantity"),
    packingSize: Yup.number().typeError("Invalid packing size selected ").default(0)
})

export { oderSchema }