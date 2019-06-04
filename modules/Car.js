/** @type {WeakMap<object, number>} */
const _gas = new WeakMap
/** @type {WeakMap<object, string>} */
const _color = new WeakMap
/** @type {WeakMap<object, string>} */
const _make = new WeakMap
/** @type {WeakMap<object, string>} */
const _model = new WeakMap
/** @type {WeakMap<object, number>} */
const _year = new WeakMap
/** @type {WeakMap<object, boolean>} */
const _turbo = new WeakMap

class Car {

    /** @param {string} color */
    /** @param {"Honda"|"Toyota"|"Chevrolet"} make */
    /** @param {string} model */
    /** @param {number} year */
    /** @param {boolean} [turbo=false] */
    constructor(color, make, model, year, turbo = false) {

        if (!color || (typeof color != "string")) {
            throw new Error(`Invalid Color: ${color}`)
        }
    
        if (make !== "Honda" && make !== "Toyota" && make !== "Chevrolet") {
            throw new Error(`Invalid Make: ${make}`)
        }
    
        if (!model || (typeof model != "string")) {
            throw new Error(`Invalid Model ${model}`)
        }

        if (!year || (typeof year != "number")) {
            throw new Error(`Invalid Year ${year}`)
        }

        if ((typeof turbo != "boolean" && typeof turbo != "undefined")) {
            throw new Error(`Turbo must be true or false: ${turbo}`)
        }
        _gas.set(this, 0)
        _color.set(this, color)
        _make.set(this, make)
        _model.set(this, model)
        _year.set(this, year)
        _turbo.set(this, turbo || false)
        Object.freeze(this)
    }

    drive() {
        const gas = _gas.get(this)
        if (!gas) {
            throw new Error(`Out of gas`)
        }
        _gas.set(this, gas - 1)
        console.log(`Driving a ${this.description}`)
    }

    gasLeft() {
        return _gas.get(this)
    }

    /** @param {1|2|3|4|5|6|7|8|9|10} amount */
    fillUp(amount) {
        const gasInTank = _gas.get(this) || 0
        _gas.set(this, ((amount + gasInTank) > 10) ? 10 : (amount + gasInTank))
    }

    getMake() {
        return _make.get(this) || ""
    }

    getYear() {
        return _year.get(this) || 0
    }

    get description() {
        return `${_color.get(this)} ${_year.get(this)} ${_make.get(this)} ${_model.get(this)} ${_turbo.get(this) ? "with turbo" : "without turbo"}`
    }

    beep() {
        console.log(`${this.description} beeped.`)
    }
}

module.exports = Car
