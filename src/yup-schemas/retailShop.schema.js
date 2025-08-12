import Yup from 'yup';
const retailShopSchema = Yup.object({
    entryType: Yup.number()
        .typeError("Invalid entry type")
        .required("Entry type is required"),
    productId: Yup.number()
        .typeError("Please select valid product")
        .required("Product is required"),
    quantity: Yup.number()
        .typeError("Invalid quantity")
        .min(1, "Quantity should be greater than 1")
        .required("Invalid quantity"),
    packingSizeId: Yup.number()
        .typeError("please select valid packing size")
        .required("Packing size is required")
        .default(0),
});
export { retailShopSchema }