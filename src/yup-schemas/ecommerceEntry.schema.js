import Yup from "yup";

const ecommerceEntrySchema = Yup.object({

  entryType: Yup.number()
    .typeError("Invalid entry type")
    .required("Entry type is required"),
  productId: Yup.number()
    .typeError("Please select valid product")
    .required("Product is required"),
  // unitId: Yup.number()
  //   .typeError("Please select valid unit")
  //   .required("Unit is required"),
  // weightPerUnit: Yup.number()
  //   .typeError("Please select valid weightPerUnit")
  //   .required("weightPerUnit is required"),
  masterPckSizeUnit: Yup.number()
    .typeError("Please select valid Packing Size")
    .required("Packing Size Unit is required"),
  pricePerUnit: Yup.number()
    .typeError("Please select valid pricePerUnit")
    .required("pricePerUnit is required"),
  quantity: Yup.number()
    .typeError("Invalid quantity")
    .min(1, "Quantity should be greater than 1")
    .required("Invalid quantity"),
  ecommerceUserId: Yup.number()
    .typeError("Invalid ecommerce user id")
    .required("ecommerce user id is required"),

});

export { ecommerceEntrySchema };
