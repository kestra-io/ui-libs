import {ref, nextTick} from "vue";
import {useVueFlow} from "@vue-flow/core";
import lodash from "lodash";

import TopologyComponent from "../../../src/components/topology/Topology.vue";
import TaskIcon from "./TaskIcon.vue";

export default {
    title: "Components/Topology",
    component: TopologyComponent,
};

const base = {
    render: (args, {loaded: {flowGraph, source, execution}}) => ({
        components: {TopologyComponent},
        setup() {
            const vueflowId = ref(Math.random().toString());
            const {
                fitView
            } = useVueFlow(vueflowId.value);

            nextTick(() => {
                fitView();
            });

            return () => <TopologyComponent 
                {...args} 
                iconComponent={TaskIcon} 
                source={source} 
                flowGraph={flowGraph} 
                execution={execution}
            />;
        },
    }),
    decorators: [() => ({
        template: `<div style="outline: 1px solid var(--ks-select-border);width: calc(100vw - 2rem);height: calc(100vh - 2rem);">
                <story />
            </div>`
    })],
    args: {
        id: "test",
        isHorizontal: true,
        enableSubflowInteraction: false,
        isReadOnly: false,
        isAllowedEdit: false,
        toggleOrientationButton: false,
        source: "graph",
        playgroundEnabled: false,
    },
    parameters:{
        controls:{
            exclude: [
                "id", 
                "namespace", 
                "flowId", 
                "iconComponent", 
                "source", 
                "flowGraph", 
                "icons", 
                "expandedSubflows", 
                "toggleOrientationButton", 
                "execution",
                "subflowsExecutions",
            ],
        }
    },
};

export const Blueprints = lodash.merge({},
    base,
    {
        args: {
            blueprintId: "airbyte-cloud-dbt-cloud",
        },
        argTypes: {
            blueprintId: {
                control: {type: "text"},
            },
        },
        loaders: [
            async ({args}) => {
                return {
                    flowGraph: await (await fetch(`https://api.kestra.io/v1/blueprints/${args.blueprintId}/versions/latest/graph`)).json(),
                    source: (await (await fetch(`https://api.kestra.io/v1/blueprints/${args.blueprintId}/versions/latest`)).json()).flow,
                }
            },
        ],
    }
)

import FinallySequentialData from "../../data/graphs/finally-sequential.js";

export const FinallySequential = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                return {
                    flowGraph: FinallySequentialData,
                    source: "",
                }
            },
        ],
    }
)


import FinallyParallelData from "../../data/graphs/finally-parallel.js";

export const FinallyParallel = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                return {
                    flowGraph: FinallyParallelData,
                    source: "",
                }
            },
        ],
    }
)

import FinallyForeachData from "../../data/graphs/finally-foreach.js";

export const FinallyForeach = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                return {
                    flowGraph: FinallyForeachData,
                    source: "",
                }
            },
        ],
    }
)

import PauseData from "../../data/graphs/pause.js";

export const Pause = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                return {
                    flowGraph: PauseData,
                    source: "",
                }
            },
        ],
    }
)

import SwitchScheduleData from "../../data/graphs/switch-schedule.js";

export const SwitchSchedule = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                return {
                    flowGraph: SwitchScheduleData,
                    source: "",
                }
            },
        ],
    }
)


import ErrorData from "../../data/graphs/error.js";

export const Error = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                return {
                    flowGraph: ErrorData,
                    source: "",
                }
            },
        ],
    }
)

import Simple from "../../data/graphs/simple.js";

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

export const ExecutionStatus = lodash.merge({},
    base,
    {
        loaders: [
            async () => {
                Simple.nodes.forEach((node) => {
                    node.executionId = "execution-id";
                });

                return {
                    flowGraph: Simple,
                    source: "",
                    execution: {
                        id: "execution-id",
                        taskRunList: [
                            {
                                taskId: "message",
                                state: {
                                    current: "SUCCESS",
                                    histories: [
                                        {
                                            "state": "SUCCESS",
                                            "date": "2025-07-23T14:46:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-23T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT0.51661S"
                                }
                            },
                            {
                                taskId: "message_again",
                                state: {
                                    current: "FAILED",
                                    histories: [
                                        {
                                            "state": "FAILED",
                                            "date": "2025-07-23T14:46:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-23T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT0.51661S"
                                }
                            },
                            {
                                taskId: "all_done",
                                state: {
                                    current: "RUNNING",
                                    histories: [
                                        {
                                            "state": "RUNNING",
                                            "date": new Date().toISOString()
                                        }
                                    ],
                                    startDate: new Date().toISOString(),
                                    endDate: addMinutes(new Date(), 1).toISOString(),
                                    duration: "PT0.51661S"
                                }
                            },
                            {
                                taskId: "message",
                                state: {
                                    current: "SUCCESS",
                                    histories: [
                                        {
                                            "state": "SUCCESS",
                                            "date": "2025-07-23T14:46:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-23T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT0.51661S"
                                }
                            }
                        ]
                    }
                }
            },
        ],
    }
)










