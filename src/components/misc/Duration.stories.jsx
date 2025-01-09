import Duration from "./Duration.vue"

export default {
    title: "Components/Misc/Duration",
    component: Duration
}

export const Default = {
    render: () => ({
        setup() {
            const histories = [
                {date: new Date(Date.now() - 5000), state: "CREATED"},
                {date: new Date(), state: "SUCCESS"}
            ]
            return () => <Duration histories={histories} />
        }
    })
}

export const Running = {
    render: () => ({
        setup() {
            const histories = [
                {date: new Date(Date.now() - 10000), state: "CREATED"},
                {date: new Date(), state: "RUNNING"}
            ]
            return () => <Duration histories={histories} />
        }
    })
}

export const Failed = {
    render: () => ({
        setup() {
            const histories = [
                {date: new Date(Date.now() - 15000), state: "CREATED"},
                {date: new Date(), state: "FAILED"}
            ]
            return () => <Duration histories={histories} />
        }
    })
} 