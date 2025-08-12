import Yup from "yup";
const insertInsiloSchema = Yup.object({
  siloId: Yup.number().required("Please select a silo"),
  milkQty: Yup.number()
    .min(1, "Invalid milk quantity")
    .required("Milk quantity is required"),
  milkStatus: Yup.string().required("Milk status is required"),
  trnsType: Yup.string()
    .oneOf(["in", "out"], "Invalid transaction type")
    .required("Transaction type is required"),
});

export { insertInsiloSchema };
