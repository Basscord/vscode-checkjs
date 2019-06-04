# TL:DR;

* Running a program to see where it crashes is an anti-pattern.
* This project explores VS Code's built-in ability to evaluate Javascript.
* It has no WebPack, no Babel, no Yarn, no ESLint, and no NPM. It has no package.json.
* For this exercise, the reader should endeavor to correct all defects within the editor *before* they run the code.
* Furthermore, the reader should endeavor to configure their editor in a way that highlights errors.
* Finally, `node main.js` will execute the code.
    
# VS Code Exploration with CheckJS Enabled

When I ask Javascript developers what editor they currently use, more and more, they are using VS Code. Amongst the cited reasons: VS Code is fast, extensible, and under active development. But I never find that developers are using (or even aware of) one of VS Code's most powerful and useful features: the `checkJs` compiler flag.

## Experience with Xcode

A few years ago, I took a detour from my life as a Javascript developer when I was invited to build an iOS app using Xcode. Coming from a Javascript world, Xcode offered some interesting contrasts. Some good, some bad, but one thing in particular stands out:

* **Static Analysis**
    * Xcode *knows* the entire structure of your codebase.
    * When you type `import FooLib`, Xcode knows whether or not `FooLib` is in your project.
    * When you type `FooLib()`, Xcode knows what types of parameters it takes, if any.
    * Typing **^ + Space**  provides *intelligent* autocompletions for `FooLib.`
    * **^ + ⌘ + Click**ing on anything will take you to it's definition, even outside the file.
    * When you type something *wrong*, Xcode knows, and will tell you.
        * If you type `FooLib.noMethodHere()` or `FooLib.stringChanger(stringOrNull)`, you'll get red exclamation marks where the wrong thing is, and your code won't execute until you fix it. 
        
## Coming back to Javascript

After spending a few years in this environment, coming back to Javascript felt like I was coding in the dark. Sure, the editors were fast, with neat keyboard shortcuts and great community plugins, but codebases were crawling with bugs that would have been illuminated in Xcode:

```javascript
// countdown module
function countdown(items) {
    items = items.map(item => `${item.toUpperCase()}!`)
    const countdown = items.reduce((x, item) => `${x} ${item}`)
    console.log(countdown)
}

export default countdown
```
```javascript
// main.js
import countdown from 'countdown' // What does the text editor know about countdown?
countdown(["three", "two", "one"]) // THREE! TWO! ONE!
countdown([3, 2, 1]) // Editor doesn't complain. Runtime goes boom. 💥
```

I came to realize that the critical blocker to good Javascript static analysis is, in the absence of type annotations, all function parameters in Javascript are of type `any`. They can legally be passed any type of value, in any quantity. In order to provide a better user-experience for the module user, one should annotate their methods with the expected parameter types. If the method is flexible enough to take many types of parameters of varying types and quantities, that should be documented. I will speak more on that later. But first...

# The Exercise

Without opening any other files, open `jsconfig.js`, and `main.js` side-by-side in VS Code. Notice that, in `jsconfig.js`, the `checkJs` compiler option is commented out. Also notice that `main.js` exhibits no errors (though in truth it has many.) How does this experience compare to the Xcode experience I described above?

* **VS Code Default Static Analysis**
    * VS Code knows *something* about your project.
        * This is because the existence of a jsconfig.json file defines a project root.
    * When you type `require("./Car")`, VS Code silently knows whether `Car` is found or not.
      * Try moving, renaming, or deleting `Car.js`. Notice the editor doesn't complain.
      * Restore the file. 😅
    * When you hover over the `new Car()` constructor, VS Code knows what types of parameters it takes.
      * Inspection reveals that we are providing the parameters out of order, but not being warned.
      * Further inspection reveals that "Boeing" is not an acceptable car make.
    * Typing **^ + Space**  provides *intelligent* autocompletions for `car1.`
    * **⌘ + Click**ing on anything will take you to it's definition, even outside the file.
      * Again, this is thanks to the jsconfig.json file.
    * When you type something *wrong*, VS Code knows, and will *not* tell you.
        * If you type `car1.noMethodHere()` or `car1.fillUp(nope)`, you will *not* get red marks or underlines where the wrong thing is.

Now turn on checkJs by uncommenting it in `jsconfig.js` and saving the file. What happens to `main.js`?

* **VS Code Default Static Analysis *With checkJs***
    * If `require("./Car")` is not found, VS Code will tell you. In Red.
      * Try moving, renaming, or deleting `Car.js`.
      * Again, Restore the file.
    * VS Code explicitly underlines the `new Car()` constructor's invalid parameters. In Red.
    * When you type something *wrong*, VS Code knows, and tells you. In Red.
        * If you type `car1.noMethodHere()` or `car1.fillUp(nope)`, you get red underlines where the wrong things are.
    * Like Xcode, fixing the errors will reveal more wrong things.

**Replace the five invalid cars with these five *valid* cars:**

```javascript
const car1 = new Car("Green", "Honda", "Civic", 1979)
const car2 = new Car("Blue", "Toyota", "Corolla", 1982)
const car3 = new Car("White", "Chevrolet", "Corvette", 1987)
const car4 = new Car("Red", "Chevrolet", "Cruze", 2014, true)
const car5 = new Car("Green", "Toyota", "Trecel", 1991)
```

* Now notice that `car.year` and `car.make` are not actually accessible properties of `Car` instances.
* Erase these errant property access attempts.
* Notice that autocomplete provides similarly named methods for `Car` instances:
    * `car.getYear()`
    * `car.getMake()`

**Replace the errant property access attempts with the *valid* getter methods:**
```javascript
// List the brands of our cars that were made after 1990:
const cars = [car1, car2, car3, car4, car5]
const newCars = cars.filter(car => car.getYear() > 1990)
const newCarBrands = newCars.map(car => car.getMake())
const newCarBrandsList = newCarBrands.join(", ")
assert.equal(newCarBrandsList, "Chevrolet, Toyota")
```

Finally, Take car #5 for a drive.

**Replace the final errant property access attempts and method calls with the appropriate methods, using autocomplete and checkJs.**

*At this point, I will leave the exercise to the reader. Feel free to make any other modifications that you feel would make the code more robust. See the `save-points` folder for the complete solutions at various points. How does the `checkJs` compile flag affect your workflow?*

# How is this possible?

Inside of `./modules/Car.js` I utilize [JSDoc](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript) to describe method parameters. This helps VS Code narrow down what is legal to pass in. Without these type-annotations, VS Code defines pretty much all method parameters as type `any` (because that's how Javascript behaves.) JSDoc doesn't actually change Javascript, it just provides hints to VS Code, and to the user, about what input the function will or will not accept. It is up to the function's implementation to enforce the documented rules.

After evaluating the JSDoc annotations, VS Code uses it's TypeScript engine to evaluate the Javascript project to see if the Javascript is correct, or if there are errors in the project. It's essentially being treated as a Typescript project. It might be worth playing with some of the other [compiler options](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Compiler%20Options.md) to tune how strict it is.

# Introspection

While I feel that, on the whole, the turning on the `checkJs` compiler option brings vast improvements, it can be time consuming to apply this type of rigor to all things. The beauty of modern Javascript is in how tersely many solutions can be written, without the pervasive type-coersion cruft that is required in compiled languages. In this workflow, if you find yourself excessively obsessing over code which is written optimally and works correctly, but shows red squiggly lines because of type-insecurity, you can always just throw a `//@ ts-ignore` on a specific line of code, or a `//@ts-nocheck` on a file and move on. Again, the goal is for the computer to serve you, not for you to serve the computer.

# Benediction
If you've made it this far, you're amazing! Let me know your thoughts. Feel free to pull-request me with anything you think would improve this project. Also, feel free reach out to me with any questions or thoughts you may have on the subject. Thanks!

# Resources
[JSDoc Support in VS Code.](https://github.com/Microsoft/TypeScript/wiki/JSDoc-support-in-JavaScript)

[JSConfig Compiler Options.](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Compiler%20Options.md)

[Type Checking Javascript Files.](https://github.com/Microsoft/TypeScript/wiki/Type-Checking-JavaScript-Files)

[DefinitelyTyped: Typings For Just About Everything Used in the JS Ecosystem.](https://github.com/DefinitelyTyped/DefinitelyTyped)