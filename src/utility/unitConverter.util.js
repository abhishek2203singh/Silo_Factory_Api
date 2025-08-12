import convert from "convert-units";
const unitConverter = {
    convertUnit(quantity, fromUnit, toUnit) {
        console.log("convert inputs ==>", {
            quantity,
            fromUnit,
            toUnit
        })

        this.fromUnit = fromUnit.toLowerCase()
        this.toUnit = toUnit.toLowerCase()
        return {
            result: convert(quantity).from(this.fromUnit).to(this.toUnit),
            fromUnit: fromUnit,
            toUnit: toUnit,
            original: quantity
        };
    },

    possibleConversions(fromUnit) {
        return convert().from(fromUnit).possibilities()
    }
    ,
    allSupportedUnits() {
        return convert().list()
    },
    allSupportedUnitsFromCategory(category = "mass") {
        return convert().list(category)
    },
    convertInBaseUnit(from = "ml", quality = 1) {
        return convert(quality).from(from).base();
    }

}
console.log(unitConverter.possibleConversions("l"))
// console.log(unitConverter.allSupportedUnitsFromCategory("mass"))
export { unitConverter }