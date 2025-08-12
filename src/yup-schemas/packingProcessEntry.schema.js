import Yup from "yup";
const packingProcessSchema = Yup.object({
    productId: Yup.number()
        .typeError("please select valid product")
        .required("product is required"),
    packingMaterialId: Yup.number()
        .typeError("please select valid Packing Material")
        .required("product is required"),
    // packingMaterialQuantity: Yup.number()
    //     .typeError("please select  packing material quantity")
    //     .required("packing material quantity is required "),
    packingSizeId: Yup.number()
        .typeError("please select packing size")
        .required("packing size is required "),
    // unitId: Yup.number()
    //     .typeError("please select product's unit of measurement like KG . LTR")
    //     .required("product unit is required "),
    totalPackings: Yup.number()
        .typeError("please enter valid No. of packings")
        .required("total packings is required "),

});

export { packingProcessSchema };
