import Yup from "yup";
import { customMessage } from "../utility/messages.util.js";
const idSchema = Yup.object({
  id: Yup.number()
    .typeError(customMessage.badReq)
    .min(1, customMessage.badReq)
    .required(customMessage.badReq),
});

export { idSchema };
