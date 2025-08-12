function parcentageValue(baseValue, percentage) {

    this.base = Number(baseValue);
    this.percentage = Number(percentage);

    if (!this.percentage) {
        return 0
    }
    return (this.base * this.percentage) / 100;

}

const calc = {
    percentageValue: parcentageValue
}

export default calc