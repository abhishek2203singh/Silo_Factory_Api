// to check the state of the current logged in user is this distribution , customer , retail shop ,delivery boy 

const currentUser = (user) => {
    const data = {
        isDistrubution: false,
        isCustomer: false,
        isDeliveryBoy: false,
        isAdmin: false,
        isRetailShop: false
    }

    if (user.id == 1) {
        data.isAdmin = true
    }

    // if distribution center is logged in 
    if (user.department_id == 6 && user.role_id == 12) {
        data.isDistrubution = true
    }

    // if retail shop is logged in 
    if (user.department_id == 7 && user.role_id == 8) {
        data.isRetailShop = true
    }

    // is deliveryBoy logged in 
    if (user.department_id == 6 && user.role_id == 1) {
        data.isDeliveryBoy = true
    }
    // is customer is logged in 
    if (user.department_id == 6 && user.role_id == 4) {
        data.isCustomer = true
    }

    return data
}

export { currentUser }