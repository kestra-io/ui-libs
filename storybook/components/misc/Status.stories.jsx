import Status from "../../../src/components/misc/Status.vue"
import StateUtil from "../../../src/utils/state"

const STATUSES = Object.keys(StateUtil.icon()).map(key => key.toUpperCase())

export default {
    title: "Components/Misc/Status",
    component: Status,
    argTypes: {
        status: {
            control: "select",
            options: STATUSES
        },
        icon: {
            control: "boolean"
        },
        size: {
            control: "select",
            options: ["large", "default", "small"]
        },
        title: {
            control: "text"
        }
    }
}

export const {
    CREATED,
    RESTARTED,
    SUCCESS,
    RUNNING,
    KILLING,
    KILLED,
    WARNING,
    FAILED,
    PAUSED,
    CANCELLED,
    SKIPPED,
    QUEUED,
    RETRYING,
    RETRIED,
    BREAKPOINT
} = Object.fromEntries(
    StateUtil.arrayAllStates().map((state) => [
        state.name,
        {args: {status: state.name}}
    ])
);

export const WithIcon = {
    args: {
        status: "SUCCESS",
        icon: true,
        title: "SUCCESS"
    }
}

export const CustomTitle = {
    args: {
        status: "RUNNING",
        title: "Custom Title",
    }
}

export const SmallSize = {
    args: {
        status: "SUCCESS",
        size: "small",
    }
}

export const LargeSize = {
    args: {
        status: "RUNNING",
        size: "large",
    }
}