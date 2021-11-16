function createMachine(stateMachineDefinition) {
    const machine = {
        value: stateMachineDefinition.initialState,
        transition(currentState, event) {
            const currentStateDefinition = stateMachineDefinition[currentState]      // off 对象
            const destinationTransition = currentStateDefinition.transitions[event]  // switch 对象
            if (!destinationTransition) {
                return
            }
            const destinationState = destinationTransition.target                     // switch.target 
            const destinationStateDefinition = stateMachineDefinition[destinationState] // on 对象

            destinationTransition.action()
            currentStateDefinition.actions.onExit()
            destinationStateDefinition.actions.onEnter()

            machine.value = destinationState

            return machine.value
        }
    }

    return machine
}

const machine = createMachine({
    initialState: 'off',
    off: {
        actions: {
            onEnter() {
                console.log('off: onEnter')
            },
            onExit() {
                console.log('off: onExit')
            },
        },
        transitions: {
            switch: {
                target: 'on',
                action() {
                    console.log('transition action for "switch" in "off" state')
                }
            },
        },
    },
    on: {
        actions: {
            onEnter() {
                console.log('off: onEnter')
            },
            onExit() {
                console.log('off: onExit')
            },
        },
        transitions: {
            switch: {
                target: 'off',
                action() {
                    console.log('transition action for "switch" in "on" state')
                }
            },
        },
    },
})

let state = machine.value
console.log(`current statue: ${state}`)

state = machine.transition(state, 'switch')
console.log(`current state: ${state}`)

state = machine.transition(state, 'switch')
console.log(`current state: ${state}`)