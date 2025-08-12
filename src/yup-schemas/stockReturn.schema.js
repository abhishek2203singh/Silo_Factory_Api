import Yup from 'yup';

const forReturnStockSchema = Yup.object({
    message: Yup.string().required("Cause of Return required!!"),
    productId: Yup.number().typeError("Please select valid product").required("Product is required"),
    quantity: Yup.number().typeError("Invalid quantity").min(1, "Quantity should be greater than 1").required("Invalid quantity"),
    masterPckSizeUnit: Yup.number().transform((value, originalValue) => {
        return originalValue === '' ? undefined : Number(originalValue);
    })
        .typeError("Please select a valid unit")
        .required("packing Size is required"),
});
export { forReturnStockSchema }

