import Yup from "yup";
import { registerSchema } from "./registUser.schema.js";

const newUserSchema = registerSchema.pick([
  "pincode",
  "state",
  "city",
  "address",
  "mobile",
  "email",
]);
const distibutionDpt = Yup.object({
  centerName: Yup.string().required("Name is required"),
  manager: Yup.number()
    .typeError("Please select Manager")
    .required("Please select Manager"),
  centerCode: Yup.string()
    .required("Please enter center code")
    .required("Center code is required"),
});
const distributionCenterSchema = newUserSchema.concat(distibutionDpt);

export { distributionCenterSchema };
