import Yup from "yup";

const departmentEntrySchema = Yup.object({
    entryType: Yup.number()
        .typeError("Invalid entry type")
        .required("Entry type is required"),
    productId: Yup.number()
        .typeError("Please select valid product")
        .required("Product is required"),
    unitId: Yup.number()
        .typeError("Please select valid unit")
        .required("Unit is required"),
    quantity: Yup.number()
        .typeError("Invalid quantity")
        .min(1, "Quantity should be greater than 1")
        .required("Invalid quantity"),
    departmentId: Yup.number() // id of destination department
        .typeError("Please select department")
        .required("Please select department"),
    departmentHead: Yup.number() // id of destination department head
        .typeError("Please select department head")
        .required("Please select department head"),
    packingSizeId: Yup.number()
        .typeError("please select valid packing size")
        .required("Packing size is required")
        .default(0),
    productTypeId: Yup.number()
        .typeError("please select valid product type ")
        .required("product type is required")
        .default(0),
});

export { departmentEntrySchema };
