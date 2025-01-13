import AddTaskButton from "../../../src/components/buttons/AddTaskButton.vue"

export default {
    title: "Components/Buttons/AddTaskButton",
    component: AddTaskButton,
    argTypes: {
        addTask: {
            control: "boolean"
        }
    }
}

export const Default = {
    args: {
        addTask: true
    }
}

export const Hidden = {
    args: {
        addTask: false
    }
} 
