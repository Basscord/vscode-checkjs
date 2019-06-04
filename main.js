'use strict'
const assert = require('assert')
const Car = require("./modules/Car")

// Create Five Cars:
const car1 = new Car("Honda", "Civic", "Green", 1979)
const car2 = new Car("Toyota", "Corolla", "Blue", 1982)
const car3 = new Car("Boeing", "747", "White", 1987)
const car4 = new Car("Chevrolet", "Cruze", "Red", 2014, true)
const car5 = new Car("Toyota", "Trecel", "Green", 1991)

// List the brands of our cars that were made after 1990:
const cars = [car1, car2, car3, car4, car5]
const newCars = cars.filter(car => car.year > 1990)
const newCarBrands = newCars.map(car => car.make)
const newCarBrandsList = newCarBrands.join(", ")
assert.equal(newCarBrandsList, "Chevrolet, Toyota")

// Take car #5 for a drive:
car5.gas = 10
car5.drive()
car5.honk()
assert.equal(car5.description, "Green 1991 Toyota Trecel without turbo")
