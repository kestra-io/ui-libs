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
            >
                {
                    {
                        taskDetails: args.taskDetails
                    }
                }
            </TopologyComponent>;
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
        playgroundReadyToStart: true,
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
                    isHorizontal: false,
                    source: "",
                    execution: {
                        id: "execution-id",
                        taskRunList: [
                            {
                                taskId: "SUCCESS",
                                state: {
                                    current: "SUCCESS",
                                    histories: [
                                        {
                                            state: "SUCCESS",
                                            date: "2025-07-22T14:40:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-21T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT17.39661S"
                                }
                            },
                            {
                                taskId: "FAILED",
                                state: {
                                    current: "FAILED",
                                    histories: [
                                        {
                                            state: "FAILED",
                                            date: "2025-07-23T14:46:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-23T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT3.51661S"
                                }
                            },
                            {
                                taskId: "RUNNING",
                                state: {
                                    current: "RUNNING",
                                    histories: [
                                        {
                                            state: "RUNNING",
                                            date: new Date().toISOString()
                                        }
                                    ],
                                    startDate: new Date().toISOString(),
                                    endDate: addMinutes(new Date(), 1).toISOString(),
                                    duration: "PT0.51661S"
                                }
                            },
                            {
                                taskId: "SUCCESS",
                                state: {
                                    current: "SUCCESS",
                                    histories: [
                                        {
                                            state: "SUCCESS",
                                            date: "2025-07-23T14:46:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-23T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT0.51661S"
                                }
                            },
                            {
                                taskId: "SKIPPED",
                                state: {
                                    current: "SKIPPED",
                                    histories: [
                                        {
                                            state: "SKIPPED",
                                            date: "2025-07-23T14:46:48.081987Z"
                                        }
                                    ],
                                    startDate: "2025-07-23T14:46:47.565377Z",
                                    endDate: "2025-07-23T14:46:48.081987Z",
                                    duration: "PT0.51661S"
                                }
                            },
                            {
                                taskId: "WARNING",
                                state: {
                                    current: "WARNING",
                                    histories: [
                                        {
                                            state: "WARNING",
                                            date: "2025-07-23T14:46:48.081987Z"
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


import CustomNodesData from "../../data/graphs/custom-nodes.js";

export const CustomNodes = lodash.merge({},
    base,
    {
        args: {
            isHorizontal: false,
        },
        loaders: [
            async () => {
                return {
                    flowGraph: CustomNodesData,
                    source: "",
                }
            },
        ],
    }
)

import NodeDetailsData from "../../data/graphs/node-details.js";

export const NodeDetails = lodash.merge({},
    base,
    {
        args: {
            isHorizontal: true,
            taskDetails: (props) => {
                return (<ul style={{
                    textAlign: "left", 
                    padding: "1rem", 
                    margin: 0,
                    listStyleType: "none", 
                    fontSize: "10px", 
                    borderTop: "1px solid var(--ks-border-primary)", 
                    backgroundColor: "var(--ks-background-body)",
                    borderRadius: "0 0 .5rem .5rem",
                    overflow: "auto",
                }}>{
                    Object.keys(props?.data?.node.task || {}).map((key) => {
                        return <li style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} title={`${key}: ${JSON.stringify(props.data.node.task[key])}`}>
                            <strong>{key}:</strong> {JSON.stringify(props.data.node.task[key])}
                        </li>
                    })
                }</ul>)
            },
            getNodeDimensions(node, getNodeWidth, getNodeHeight) {
                const taskNodeHeightByType = {
                    "io.kestra.plugin.jdbc.clickhouse.BulkInsert": 139,
                    "io.kestra.plugin.serdes.avro.AvroToIon": 139,
                    "io.kestra.plugin.azure.datafactory.CreateRun": 124,
                }

                const taskType = node?.task?.type;
                console.log("Getting dimensions for node", taskType, taskNodeHeightByType?.[taskType]);
                return {
                    width: getNodeWidth(node),
                    height: taskType ? taskNodeHeightByType?.[taskType] ?? getNodeHeight(node) : getNodeHeight(node),
                }
            },
            
        },
        loaders: [
            async () => {
                return {
                    flowGraph: NodeDetailsData,
                    source: "",
                }
            },
        ],
    }
)









