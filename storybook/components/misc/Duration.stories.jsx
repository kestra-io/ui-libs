import Duration from "../../../src/components/misc/Duration.vue"
import State from "../../../src/utils/state"

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

export const AllStates = {
    render: () => ({
        setup() {
            const histories = (state) => [
                {date: new Date(Date.now() - 5000), state},
                {date: new Date(), state}
            ]
            return () => {
                return <div style="display: flex; flex-direction: column; gap: 1rem;">
                    {Object.keys(State.allStates()).map((state) => <div>{state} - <Duration key={state} histories={histories(state)} /></div>)}
                </div>
            }
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
