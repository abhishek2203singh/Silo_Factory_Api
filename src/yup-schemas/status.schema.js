import Yup from "yup";

const stausSchema = Yup.object({
  status: Yup.number()
    .typeError("invalid status")
    .required("please select status "),
});
export { stausSchema };
