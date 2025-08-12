
import crypto from 'crypto'

const orderGenerator = () => {
    const timeStamp = Date.now().toString();
    const time = timeStamp.slice(-2)

    return crypto.randomInt(100000, 1000000) + time


}

export { orderGenerator }