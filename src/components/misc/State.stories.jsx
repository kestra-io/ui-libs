import State from "./State.vue"

export default {
    title: "Components/Misc/State",
    component: State,
    argTypes: {
        color: {
            control: "select",
            options: ["primary", "danger", "success", "warning"]
        }
    }
}

export const Primary = {
    args: {
        color: "primary"
    }
}

export const Danger = {
    args: {
        color: "danger"
    }
}

export const Success = {
    args: {
        color: "success"
    }
}

export const Warning = {
    args: {
        color: "warning"
    }
} 