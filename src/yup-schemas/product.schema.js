import Yup from "yup";
const productSchema = Yup.object({
    productName: Yup.string("Invalid Product Name").required(
        "Product Name is required"
    ),
    productType: Yup.number()
        .typeError("Invalid Product Type")
        .required("product type is required"),
    productImage: Yup.string("Invalid Product Image").required(
        "Product Image is required"
    ),
    unitId: Yup.string("Invalid UOM").required("Unit of Measure is required"),
    status: Yup.number().default(1),
    roughProductId: Yup.number()
        .typeError("Please select valid rough product")
        .default(0),
    isGstIncluded: Yup.number()
        .default(0),
    mrp: Yup.number()
        .typeError("please enter a valid selling MRP")
        .required("selling price is required"),
    basePrice: Yup.number()
        .typeError("please enter a valid base price")
        .required("Base price is required"),
    cgst: Yup.number()
        .typeError("please enter a valid CGST ").default(0.00),
    sgst: Yup.number()
        .typeError("please enter a valid SGST")
        .default(0.00),
    deliveryCharges: Yup.number()
        .typeError("please enter a valid packed price")
        .required("packed price is required"),



});

export { productSchema };
