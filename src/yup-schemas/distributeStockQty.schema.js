import Yup from 'yup'
import { customMessage } from '../utility/messages.util.js';
const transferStockQtySchema = Yup.object({
  dispatchedStockQty: Yup.number()
    .typeError("Invalid quantity")
    .min(1, "Quantity should be greater than 1")
    .required("Invalid quantity"),
  trnsMessage: Yup.string()
    .required("message required"),
  sellingPrice: Yup.number()
    .typeError("Please select valid Selling Price")
    .required("Selling Price is required"),
  id: Yup.number()
    .typeError(customMessage.badReq)
    .min(1, customMessage.badReq)
    .required(customMessage.badReq),
});
export { transferStockQtySchema }