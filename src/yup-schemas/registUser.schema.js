import Yup from "yup";
const registerSchema = Yup.object({
    full_name: Yup.string("Invalid name").required("Name is required"),
    email: Yup.string().nullable().email("Invalid email").default(""),
    mobile: Yup.string("Invalid Mobile Number")
        .matches(/^\d{10}$/, "Mobile number must be 10 digits long")
        .required("Mobile number is required"),
    password: Yup.string("Invalid password").min(6, "Password must be at least 6 characters long").required("Password is required"),
    department_id: Yup.number("Invalid department").required(
        "please select department"
    ),
    role_id: Yup.number("Invalid role").required("please select role"),
    facebook_id: Yup.string("Invalid facebook_id"),
    google_id: Yup.string("Invalid google_id"),
    address: Yup.string("Invalid address").required("address is required"),
    city: Yup.number("Invalid city").required("Please select city"),
    state: Yup.number("Invalid state").required("Please select state"),
    pincode: Yup.string()
        // .transform((value) => (value ? Number(value) : ""))
        .required("Please enter pincode")
        .matches(/^\d{6}$/, "Invalid pincode"),
    profile_photo: Yup.string().default("user.jpeg"),
    salary: Yup.number()
        .transform((value, originalValue) => {
            return originalValue == null ? 0 : value;
        })
        .default(0),
    gender: Yup.string()
        .oneOf(["male", "female"], "please select gender")
        .required("gender is required"),
    about_me: Yup.string().default(""),
});

export { registerSchema };
