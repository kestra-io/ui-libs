<template>
    <VueFlow
        :id="id"
        :default-marker-color="cssVariable('--bs-cyan')"
        fit-view-on-init
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elevate-nodes-on-select="false"
        :elevate-edges-on-select="false"
    >
        <Background :pattern-color="darkTheme ? cssVariable('--bs-grey-500') : cssVariable('--bs-grey-300')" />

        <template #node-cluster="clusterProps">
            <ClusterNode
                v-bind="clusterProps"
                @collapse="collapseCluster($event, true)"
            />
        </template>

        <template #node-dot="dotProps">
            <DotNode
                v-bind="dotProps"
            />
        </template>

        <template #node-task="taskProps">
            <TaskNode
                v-bind="taskProps"
                :icons="icons"
                :icon-component="iconComponent"
                @edit="emit(EVENTS.EDIT, $event)"
                @delete="emit(EVENTS.DELETE, $event)"
                @expand="expand($event)"
                @open-link="emit(EVENTS.OPEN_LINK, $event)"
                @show-logs="emit(EVENTS.SHOW_LOGS, $event)"
                @show-description="emit(EVENTS.SHOW_DESCRIPTION, $event)"
                @show-condition="emit(EVENTS.SHOW_CONDITION, $event)"
                @mouseover="onMouseOver($event)"
                @mouseleave="onMouseLeave()"
                @add-error="emit('on-add-flowable-error', $event)"
                :enable-subflow-interaction="enableSubflowInteraction"
            />
        </template>

        <template #node-trigger="triggerProps">
            <TriggerNode
                v-bind="triggerProps"
                :icons="icons"
                :icon-component="iconComponent"
                :is-read-only="isReadOnly"
                :is-allowed-edit="isAllowedEdit"
                @delete="emit(EVENTS.DELETE, $event)"
                @edit="emit(EVENTS.EDIT, $event)"
                @show-description="emit(EVENTS.SHOW_DESCRIPTION, $event)"
            />
        </template>

        <template #node-collapsedcluster="CollapsedProps">
            <CollapsedClusterNode
                v-bind="CollapsedProps"
                @expand="expand($event)"
            />
        </template>

        <template #edge-edge="EdgeProps">
            <EdgeNode
                v-bind="EdgeProps"
                :yaml-source="source"
                @add-task="emit(EVENTS.ADD_TASK, $event)"
                :is-read-only="isReadOnly"
                :is-allowed-edit="isAllowedEdit"
            />
        </template>

        <Controls :show-interactive="false">
            <ControlButton @click="emit('toggle-orientation', $event)" v-if="toggleOrientationButton">
                <SplitCellsVertical :size="48" v-if="!isHorizontal" />
                <SplitCellsHorizontal v-if="isHorizontal" />
            </ControlButton>
            <ControlButton @click="toggleCascader"> 
                <Download />
            </ControlButton>
            <ul v-if="isCascaderOpen" class="cascader">
                <li @click="exportToPNG" class="cascader-item">
                    Export to .PNG
                </li>
                <li class="cascader-item">
                    Export to .draw.io
                </li>
            </ul>
        </Controls>
    </VueFlow>
</template>
<script lang="ts" setup>
    import {computed, nextTick, onMounted, PropType, ref, watch} from "vue";
    import {useVueFlow, VueFlow, XYPosition} from "@vue-flow/core";
    import {ControlButton, Controls} from "@vue-flow/controls";
    import {Background} from "@vue-flow/background";
    // @ts-expect-error no types for internals necessary
    import ClusterNode from "../nodes/ClusterNode.vue";
    // @ts-expect-error no types for internals necessary
    import DotNode from "../nodes/DotNode.vue";
    // @ts-expect-error no types for internals necessary
    import EdgeNode from "../nodes/EdgeNode.vue";
    // @ts-expect-error no types for internals necessary
    import TaskNode from "../nodes/TaskNode.vue";
    // @ts-expect-error no types for internals necessary
    import TriggerNode from "../nodes/TriggerNode.vue"
    // @ts-expect-error no types for internals necessary
    import CollapsedClusterNode from "../nodes/CollapsedClusterNode.vue";
    // @ts-expect-error no types for internals necessary
    import SplitCellsVertical from "../../assets/icons/SplitCellsVertical.vue";
    // @ts-expect-error no types for internals necessary
    import SplitCellsHorizontal from "../../assets/icons/SplitCellsHorizontal.vue";
    import Download from "vue-material-design-icons/Download.vue";
    import {cssVariable} from "../../utils/global";
    import {CLUSTER_PREFIX, EVENTS} from "../../utils/constants"
    import Utils from "../../utils/Utils"
    import VueFlowUtils, {type FlowGraph} from "../../utils/VueFlowUtils";
    import {YamlUtils} from "../../utils/YamlUtils";
    import {useScreenshot} from "./screenshot/useScreenshot";


    const props = defineProps({
        id: {
            type: String,
            required: true
        },
        isHorizontal: {
            type: Boolean,
            default: true,
        },
        isReadOnly: {
            type: Boolean,
            default: true,
        },
        isAllowedEdit: {
            type: Boolean,
            default: false,
        },
        source: {
            type: String,
            default: undefined,
            required: true,
        },
        toggleOrientationButton: {
            type: Boolean,
            default: false,
        },
        flowGraph: {
            type: Object as PropType<FlowGraph>,
            required: true
        },
        flowId: {
            type: String,
            required: false,
            default: undefined
        },
        namespace: {
            type: String,
            required: false,
            default: undefined
        },
        expandedSubflows: {
            type: Array,
            default: () => []
        },
        icons: {
            type: Object,
            default: undefined
        },
        iconComponent: {
            type: Object,
            default: undefined
        },
        enableSubflowInteraction: {
            type: Boolean,
            default: true
        }
    });

    const dragging = ref(false);
    const lastPosition = ref<XYPosition | null>()
    const {getNodes, onNodeDrag, onNodeDragStart, onNodeDragStop, fitView, setElements, vueFlowRef} = useVueFlow({id: props.id});
    const edgeReplacer = ref({});
    const hiddenNodes = ref<string[]>([]);
    const collapsed = ref(new Set<string>());
    const clusterToNode = ref([])
    const {capture} = useScreenshot();


    const emit = defineEmits(
        [
            EVENTS.EDIT,
            EVENTS.DELETE,
            EVENTS.OPEN_LINK,
            EVENTS.SHOW_LOGS,
            EVENTS.SHOW_DESCRIPTION,
            "on-add-flowable-error",
            EVENTS.ADD_TASK,
            "toggle-orientation",
            "loading",
            "swapped-task",
            "message",
            "expand-subflow",
            EVENTS.SHOW_CONDITION
        ]
    )

    onMounted(() => {
        generateGraph();

    })

    watch(() => props.flowGraph, () => {
        generateGraph();
    })

    watch(() => props.isHorizontal, () => {
        generateGraph();
    })

    const generateGraph = () => {
        VueFlowUtils.cleanGraph(props.id);

        nextTick(() => {
            emit("loading", true);

            // Workaround due to start & end nodes regeneration when fetching the graph again
            const oldCollapsed = collapsed.value;
            collapsed.value = new Set<string>();
            hiddenNodes.value = [];
            edgeReplacer.value = {};
            oldCollapsed.forEach(n => collapseCluster(CLUSTER_PREFIX + n, false, false))

            const elements = VueFlowUtils.generateGraph(
                props.id,
                props.flowId,
                props.namespace,
                props.flowGraph,
                props.source,
                hiddenNodes.value,
                props.isHorizontal,
                edgeReplacer.value,
                collapsed.value,
                clusterToNode.value,
                props.isReadOnly,
                props.isAllowedEdit,
                props.enableSubflowInteraction
            );
            if(elements) {
                setElements(elements);
                fitView();
                emit("loading", false);
            }
        })
    }

    // Graph interactions functions
    const onMouseOver = (node: any) => {
        if (!dragging.value) {
            VueFlowUtils.linkedElements(props.id, node.uid).forEach((n) => {
                if (n?.type === "task") {
                    n.style = {...n.style, outline: "0.5px solid " + cssVariable("--bs-gray-900")}
                    n.class = "rounded-3"
                }
            });
        }

    }

    const onMouseLeave = () => {
        resetNodesStyle();
    }

    const resetNodesStyle = () => {
        getNodes.value.filter(n => n.type === "task" || n.type === "trigger")
            .forEach(n => {
                n.style = {...n.style, opacity: "1", outline: "none"}
                n.class = ""
            })
    }

    onNodeDragStart((e) => {
        dragging.value = true;
        resetNodesStyle();
        e.node.style = {...e.node.style, zIndex: 1976}
        lastPosition.value = e.node.position;
    })

    onNodeDragStop((e:any) => {
        dragging.value = false;
        if (e.intersections && checkIntersections(e.intersections, e.node) === null) {
            const taskNode1 = e.node;
            // check multiple intersection with task
            const taskNode2 = e.intersections.find((n:any) => n.type === "task");
            if (taskNode2) {
                try {
                    if(props.source){
                        emit("swapped-task", {
                            newSource: YamlUtils.swapTasks(props.source, Utils.afterLastDot(taskNode1.id) ?? "", Utils.afterLastDot(taskNode2.id) ?? ""),
                            swappedTasks: [taskNode1.id, taskNode2.id]
                        })
                    }
                } catch (e: any) {
                    emit("message", {
                        variant: "error",
                        title: "cannot swap tasks",
                        message: `${e.message}, ${e.messageOptions}`
                    });
                    taskNode1.position = lastPosition.value;
                }
            } else {
                taskNode1.position = lastPosition.value;
            }
        } else {
            e.node.position = lastPosition.value;
        }
        resetNodesStyle();
        e.node.style = {...e.node.style, zIndex: 5}
        lastPosition.value = null;
    })

    const subflowPrefixes = computed(() => {
        if(!props.flowGraph?.clusters) {
            return [];
        }

        return props.flowGraph.clusters.filter(cluster => cluster.cluster.type.endsWith("SubflowGraphCluster"))
            .map(cluster => cluster.cluster.taskNode.uid + ".");
    })

    onNodeDrag((e: any) => {
        resetNodesStyle();
        getNodes.value.filter(n => n.id !== e.node.id).forEach(n => {
            if (n.type === "trigger" || (n.type === "task" && (n.id.startsWith(e.node.id + ".") || e.node.id.startsWith(n.id + "."))) || subflowPrefixes?.value?.some(subflowPrefix => n.id.startsWith(subflowPrefix))) {
                n.style = {...n.style, opacity: "0.5"}
            } else {
                n.style = {...n.style, opacity: "1"}
            }
        })
        if (e.intersections && !checkIntersections(e.intersections, e.node) && e.intersections.filter((n:any) => n.type === "task").length === 1) {
            e.intersections.forEach((n:any) => {
                if (n.type === "task") {
                    n.style = {...n.style, outline: "0.5px solid " + cssVariable("--bs-primary")}
                    n.class = "rounded-3"
                }
            })
            e.node.style = {...e.node.style, outline: "0.5px solid " + cssVariable("--bs-primary")}
            e.node.class = "rounded-3"
        }
    })

    const checkIntersections = (intersections:any, node:any) => {
        const tasksMeet = intersections.filter((n:any) => n.type === "task").map((n:any) => Utils.afterLastDot(n.id));
        if (tasksMeet.length > 1) {
            return "toomuchtaskerror";
        }
        try {
            if (tasksMeet.length === 1 && props.source && YamlUtils.isParentChildrenRelation(props.source, Utils.afterLastDot(tasksMeet[0]) ?? "", Utils.afterLastDot(node.id) ?? "")) {
                return "parentchildrenerror";
            }
        } catch {
            return "parentchildrenerror";
        }
        if (intersections.filter((n:any) => n.type === "trigger").length > 0) {
            return "triggererror";
        }
        return null;
    }

    const collapseCluster = (clusterUid: string, regenerate: boolean, recursive = false) => {
        const cluster:any = props.flowGraph.clusters.find(cluster => cluster.cluster.uid.endsWith(clusterUid));
        const nodeId = clusterUid.replace(CLUSTER_PREFIX, "");
        collapsed.value.add(nodeId)

        hiddenNodes.value = hiddenNodes.value.concat(cluster.nodes.filter((e:any) => e !== nodeId || recursive));
        hiddenNodes.value = hiddenNodes.value.concat([cluster.cluster.uid] as string[])
        edgeReplacer.value = {
            ...edgeReplacer.value,
            [cluster.cluster.uid]: nodeId,
            [cluster.start]: nodeId,
            [cluster.end]: nodeId
        }

        for (let child of cluster.nodes) {
            if (props.flowGraph.clusters.map(cluster => cluster.cluster.uid).includes(child)) {
                collapseCluster(child, false, true);
            }
        }

        if (regenerate) {
            generateGraph();
        }
    }

    const expand = (expandData:any) => {
        const taskTypesWithSubflows = [
            "io.kestra.core.tasks.flows.Flow", "io.kestra.core.tasks.flows.Subflow", "io.kestra.plugin.core.flow.Subflow",
            "io.kestra.core.tasks.flows.ForEachItem$ForEachItemExecutable", "io.kestra.plugin.core.flow.ForEachItem$ForEachItemExecutable"
        ];
        if (taskTypesWithSubflows.includes(expandData.type) && !props.expandedSubflows.includes(expandData.id)) {
            emit("expand-subflow", [...props.expandedSubflows, expandData.id]);
            return;
        }
        edgeReplacer.value = {};
        hiddenNodes.value = [];
        clusterToNode.value = [];
        collapsed.value.delete(expandData.id);

        collapsed.value.forEach(n => collapseCluster(n, false, false));

        generateGraph();
    }

    const darkTheme = document.getElementsByTagName("html")[0].className.indexOf("dark") >= 0;

    const isCascaderOpen = ref(false);

    const toggleCascader = () => {
        isCascaderOpen.value = !isCascaderOpen.value;
    };

    function doScreenshot() {
        if (!vueFlowRef.value) {
            console.warn("Flow not found");
            return;
        }
        capture(vueFlowRef.value, {shouldDownload: true});
    }

    const exportToPNG = () => {
        doScreenshot();
        isCascaderOpen.value = false;
    };
</script>

<style lang="scss">
    .unused-path {
        opacity: 0.3;
    }

    .cascader {
        position: absolute;
        bottom: 0px;
        left: 40px;
        padding: 0;
        margin: 0;
        z-index: 1000;
        list-style-type: none;
        background: var(--ks-background-card);
        border: 1px solid var(--ks-border-primary);
        box-shadow: 0 12px 12px rgba(130, 103, 158, 0.1019607843);
        border-radius: 5px;
        text-align:left;
    }

    .cascader-item {
        padding: 5px 8px;
        cursor: pointer;
        color: var(--ks-content-primary);
        font-size: 12px;

        &:first-child{
            border-bottom: 1px solid var(--ks-border-primary);
        }

        &:hover {
            background: var(--ks-button-background-secondary-hover);;
        }
    }
</style>

<style lang="scss" src="./topology.scss" />
