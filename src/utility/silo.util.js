const siloUtils = {
    overFlow(siloData, upcomingQty) {
        const { capacity, total_available_milk, silo_name, hold_quantity } = siloData;
        const remainingSpace = parseFloat(
            capacity - total_available_milk - upcomingQty
        );

        if (remainingSpace < 0) {
            const availableSpace = capacity - total_available_milk;
            // in case of take is full
            if (availableSpace == 0) {
                return {
                    is: true,
                    message: `Silo '${silo_name}' is full. Current available quantity: ${total_available_milk} out of ${capacity}.`,
                    currentState: ` curent state : ${total_available_milk} / ${capacity}`,
                };
            }

            return {
                is: true,
                message: `Capacity of silo '${silo_name}' exceeded. Only ${capacity - total_available_milk
                    } liters can be added. Current quantity: ${total_available_milk} out of ${capacity}.`,
                currentState: `Current state: ${total_available_milk} / ${capacity} liters`,
            };
        }
        return { is: false };
    },
    underFlow(siloData, ongoingQty) {
        const { total_available_milk, silo_name, hold_quantity } = siloData;
        // const remainingQty = Number(total_available_milk) + Number(ongoingQty) + Number(hold_quantity); // because ongoingQty is nagitive(-)
        const remainingQty = Number(total_available_milk) + Number(ongoingQty); // because ongoingQty is nagitive(-)
        console.log("Remaining in underflow: " + Number(remainingQty));
        if (remainingQty < 0) {
            if (total_available_milk == 0) {
                return {
                    is: true,
                    message: `Silo '${silo_name}' is empty. Current available quantity: ${total_available_milk}`,
                    currentState: `avalilable quantity: ${total_available_milk}`,
                };
            }
            return {
                is: true,
                message: `Silo '${silo_name}' is underflowing. Only ${total_available_milk} Ltr. can be consumed. avalilable quantity: ${total_available_milk} `,
                currentState: `avalilable quantity: ${total_available_milk}`,
            };
        }
        return { is: false };
    },
    // to calculate total quanitity which will be removed or added to the silo
    calTotalQuantity(source) {
        // to calcualte total quantity to be added or removed
        let totalQuantity = 0;
        if (Array.isArray(source)) {
            totalQuantity = source.reduce(
                (oldVal, current) => oldVal + current.milkQty,
                0
            );
            return totalQuantity;
        }

        totalQuantity = source.milkQty;
        return totalQuantity;
    },
};

export { siloUtils };
