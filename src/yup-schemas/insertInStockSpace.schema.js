import Yup from "yup";
const insertInStockSpaceSchema = Yup.object({
  stockSpaceId: Yup.number().required("Please select a stock space"),
  quantity: Yup.number()
    .min(1, "Invalid milk quantity")
    .required("Milk quantity is required"),
  productId: Yup.number()
    .typeError("Pease select valid product")
    .required("Pease select  product"),
  unitId: Yup.number()
    .typeError("Pease select unit of measurement")
    .required("Pease select  unit of measurement"),
  trnsType: Yup.string()
    .oneOf(["in", "out"], "Invalid transaction type")
    .required("Transaction type is required"),
});

export { insertInStockSpaceSchema };
