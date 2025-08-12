import Yup from 'yup';

const distributionCenterSchema = Yup.object({
    entryType: Yup.number().typeError("Invalid entry type").required("Entry type is required"),
    productId: Yup.number().typeError("Please select valid product").required("Product is required"),
    quantity: Yup.number().typeError("Invalid quantity").min(1, "Quantity should be greater than 1").required("Invalid quantity"),   
    masterPckSizeUnit: Yup.number().transform((value, originalValue) => {return originalValue === '' ? undefined : Number(originalValue);
  })
  .typeError("Please select a valid unit")
  .required("Unit is required"),  
});
export { distributionCenterSchema }

