import TaskIcon from "./TaskIcon.vue"

export default {
    title: "Components/Misc/TaskIcon",
    component: TaskIcon,
    argTypes: {
        theme: {
            control: "select",
            options: ["dark", "light"]
        },
        onlyIcon: {
            control: "boolean"
        }
    }
}

export const Default = {
    args: {
        cls: "example-class",
        theme: "light",
        onlyIcon: false
    }
}

export const CustomIcon = {
    args: {
        customIcon: {
            icon: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMTkgOFYyMkg1VjJIMTJNMTIgNEg3VjIwSDE3VjlIMTJWNFoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==",
            flowable: true
        },
        theme: "dark",
        onlyIcon: true
    }
}

export const WithVariable = {
    args: {
        cls: "example-class",
        variable: "--bs-primary",
        onlyIcon: false
    }
} 