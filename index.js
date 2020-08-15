const FOOD_VAL = 50
const STACK_SIZE = 40
const HUNGER_RATE = 0.1 / 60
const SPOIL_TIME_IN_SECS = 40 * 60
const SPOILED_SPOIL_TIME_IN_SECS = 4 * 60 * 60
const SECS_IN_DAY = 24 * 60 * 60

class Dino {
    constructor() {
        this.food = FOOD_VAL
        this.hungry = false
    }
}

class Stack {
    constructor(total = 0, spoil_time = SPOIL_TIME_IN_SECS) {
        this.total = total
        this.spoil_time = spoil_time
        this.spoil = spoil_time
    }
}

function main() {
    const dinoInput = document.getElementById("dino-input")
    const meatInput = document.getElementById("meat-input")
    dinoInput.value = ""
    meatInput.value = ""
    document.getElementById("calc-button").onclick = () => {
        const dinoValue = parseInt(dinoInput.value)
        let meatValue = parseInt(meatInput.value)
        if (!isNaN(dinoValue) && (isNaN(meatValue) || meatValue === 0)) {
            meatValue = 1
        }
        if (isNaN(dinoValue) || isNaN(meatValue)) {
            document.getElementById("results").className = "hidden"
            document.getElementById("not-interacted").className = "hidden"
            document.getElementById("bad-input").className = ""
        } else {
            let exact = recalcMeats(dinoValue, meatValue)
            let diff = dinoValue
            while (exact !== 0) {
                if (exact === -1) {
                    meatValue += diff
                    exact = recalcMeats(dinoValue, meatValue, false)
                    if (exact === 1) {
                        diff = diff / 2
                    }
                } else {
                    meatValue -= diff
                    exact = recalcMeats(dinoValue, meatValue, false)
                    if (exact === -1) {
                        diff = diff / 2
                    }
                }
                diff = Math.floor(meatValue / 2)
            }
            while (exact === 0) {
                meatValue -= 1
                exact = recalcMeats(dinoValue, meatValue, false)
            }
            let p = document.createElement('p')
            p.innerHTML = `You would need around ${meatValue + 1} raw meat to feed ${dinoValue} dinosaurs.`
            let required = document.getElementById('total-required')
            required.innerHTML = ""
            required.appendChild(p)
        }
    }
    document.getElementById("reset-button").onclick = () => {
        dinoInput.value = ""
        meatInput.value = ""
        document.getElementById("results").className = "hidden"
        document.getElementById("not-interacted").className = ""
        document.getElementById("bad-input").className = "hidden"
    }
}

document.body.onload = main

function recalcMeats(dinosaurs = 0, meats = 0, draw = true) {
    let hungryDinos = false

    if (draw) {
        let labels = document.querySelectorAll(".hidden")
        for (let i = 0; i < labels.length; ++i) {
            labels[i].className = ""
        }
    }

    let fullStacks = Math.floor(meats / STACK_SIZE)
    let leftoverStack = meats % STACK_SIZE
    let stacks = []
    let spoiledStacks = []
    let dinos = []
    for (let i = 0; i < fullStacks; ++i) {
        stacks.push(new Stack(STACK_SIZE))
    }
    if (leftoverStack > 0) {
        stacks.push(new Stack(leftoverStack))
    }
    for (let i = 0; i < dinosaurs; ++i) {
        dinos.push(new Dino())
    }
    if (draw) {
        const stacksContainer = document.getElementById("rawmeats")
        const dinoContainer = document.getElementById("dinosaurs")
        dinoContainer.innerHTML = ""
        stacksContainer.innerHTML = ""
        stacks.forEach(stack => {
            let meatStack = document.createElement("div")
            meatStack.className = "meat-stack"
            meatStack.innerText = stack.total
            stacksContainer.appendChild(meatStack)
        });
        dinos.forEach(dino => {
            let dinosaur = document.createElement("div")
            dinosaur.className = "dinosaur"
            dinosaur.classList.add("fed")
            dinosaur.innerText = "✓"
            dinoContainer.appendChild(dinosaur)
        });
    }
    removeStacks = []
    for (let i = 0; i < SECS_IN_DAY; ++i) {
        stacks.forEach(stack => {
            stack.spoil -= 1
            if (stack.spoil <= 0) {
                stack.spoil = stack.spoil_time
                stack.total -= 1
                if (spoiledStacks.length == 0 || spoiledStacks[spoiledStacks.length - 1].total >= 100) {
                    spoiledStacks.push(new Stack(1, SPOILED_SPOIL_TIME_IN_SECS))
                } else {
                    spoiledStacks[spoiledStacks.length - 1].total += 1
                }
            }
            if (stack.total <= 0) {
                removeStacks.push(stack)
            }
        });
        removeStacks.forEach(stack => {
            stacks.splice(stacks.indexOf(stack), 1)
        });
        removeStacks = []
        spoiledStacks.forEach(stack => {
            stack.spoil -= 1
            if (stack.spoil <= 0) {
                stack.spoil = stack.spoil_time
                stack.total -= 1
            }
            if (stack.total <= 0) {
                removeStacks.push(stack)
            }
        });
        removeStacks.forEach(stack => {
            spoiledStacks.splice(stacks.indexOf(stack), 1)
        });
        removeStacks = []
        dinos.forEach(dino => {
            if (dino.hungry) {
                return
            }
            dino.food -= HUNGER_RATE
            if (dino.food <= 0) {
                if (stacks.length <= 0) {
                    dino.hungry = true
                    hungryDinos = true
                    return
                }
                let lastStack = stacks[stacks.length - 1]
                lastStack.total -= 1
                dino.food = FOOD_VAL
                if (lastStack.total <= 0) {
                    stacks.splice(stacks.indexOf(lastStack), 1)
                }
            }
        });
    }
    if (draw) {
        const afterStacksContainer = document.getElementById("after-rawmeats")
        const afterDinosContainer = document.getElementById("after-dinosaurs")
        afterStacksContainer.innerHTML = ""
        afterDinosContainer.innerHTML = ""
        stacks.forEach(stack => {
            let meatStack = document.createElement("div")
            meatStack.className = "meat-stack"
            meatStack.innerText = stack.total
            afterStacksContainer.appendChild(meatStack)
        });
        spoiledStacks.forEach(stack => {
            let meatStack = document.createElement("div")
            meatStack.className = "spoiled-stack"
            meatStack.innerText = stack.total
            afterStacksContainer.appendChild(meatStack)
        });

        dinos.forEach(dino => {
            let dinosaur = document.createElement("div")
            dinosaur.className = "dinosaur"
            if (dino.hungry) {
                dinosaur.innerText = "X"
                dinosaur.classList.add("hungry")
            } else {
                dinosaur.innerText = "✓"
                dinosaur.classList.add("fed")
            }

            afterDinosContainer.appendChild(dinosaur)
        });
        document.getElementById("results").className = ""
        document.getElementById("not-interacted").className = "hidden"
        document.getElementById("bad-input").className = "hidden"
    }

    if (hungryDinos && stacks.length === 0) {
        return -1
    } else if (!hungryDinos && stacks.length === 0) {
        return 0
    } else if (!hungryDinos && stacks.length !== 0) {
        return 1
    }
}