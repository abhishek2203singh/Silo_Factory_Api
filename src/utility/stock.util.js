const stockUtil = {
  underFlow(stockSpace, quntityToBeRemoved) {
    if (stockSpace?.available_qty < quntityToBeRemoved) {
      return {
        is: true,
        message: `only  ' ${stockSpace?.available_qty} ' quantity is available , you are requested for ${quntityToBeRemoved}`,
      };
    }
    return {
      is: false,
      message: "Ok",
    };
  },
  overFlow() {},
  calTotalQuantity(source) {
    // to calcualte total quantity to be added or removed
    let totalQuantity = 0;
    if (Array.isArray(source)) {
      totalQuantity = source.reduce(
        (oldVal, current) => oldVal + current.quantity,
        0
      );
      return totalQuantity;
    }

    totalQuantity = source.quantity;
    return totalQuantity;
  },
  isProductCompatibleWithSpace(spaceDetails, productId) {
    if (spaceDetails?.product_id !== productId) {
      const { product_name } = spaceDetails.Product;
      return {
        is: false,
        message: `only '${product_name}' can be added to stock space '${spaceDetails?.name}'`,
      };
    }
    return {
      is: true,
      message: "ok",
    };
  },
};

export { stockUtil };
