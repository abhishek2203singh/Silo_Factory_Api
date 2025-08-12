import Yup from "yup";

const userSchema = Yup.object({
    full_name: Yup.string("Invalid name").required("Name is required"),
    email: Yup.string().nullable().email("Invalid email").default(""),
    mobile: Yup.string("Invalid Mobile Number")
        .matches(/^\d{10}$/, "Mobile number must be 10 digits long")
        .required("Mobile number is required"),
    password: Yup.string("Invalid password").required("Password is required"),
    address: Yup.string("Invalid address").required("Address is required"),
    city: Yup.number("Invalid city").required("Please select city"),
    state: Yup.number("Invalid state").required("Please select state"),
    pincode: Yup.number()
        .typeError("Pincode must be a number")
        .transform((value, originalValue) => (originalValue ? Number(originalValue) : null))
        .required("Please enter pincode"),
    salary: Yup.number()
        .transform((value, originalValue) => {
            return originalValue == null ? 0 : value;
        })
        .default(0),
    about_me: Yup.string().default(""),
    facebook_page: Yup.string().default(""),
    website: Yup.string().default(""),
    security_money: Yup.number().nullable().default(0),
    date: Yup.date().nullable(),
});

export { userSchema };
