<script setup>
    import {
        ref,
        defineProps,
        defineEmits, watch, nextTick,
        onMounted
    } from "vue";
    import {
        ClusterNode,
        DotNode,
        TaskNode,
        TriggerNode,
        CollapsedClusterNode,
        EdgeNode,
    } from "../index.js";
    import {useVueFlow, VueFlow} from "@vue-flow/core";
    import {ControlButton, Controls} from "@vue-flow/controls";
    import SplitCellsVertical from "../../assets/icons/SplitCellsVertical.vue";
    import SplitCellsHorizontal from "../../assets/icons/SplitCellsHorizontal.vue";
    import {cssVariable} from "../../utils/global.js";
    import {VueFlowUtils, YamlUtils} from "../../index.js";
    import Utils from "../../utils/Utils.js";
    import VueflowUtils from "../../utils/VueFlowUtils.js";
    import {CLUSTER_UID_SEPARATOR, EVENTS} from "../../utils/constants.js";
    import {Background} from "@vue-flow/background";

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
        flowables: {
            type: Array,
            default: () => [],
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
            type: Object,
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
    });

    const dragging = ref(false);
    const lastPosition = ref(null)
    const {getNodes, onNodeDrag, onNodeDragStart, onNodeDragStop, fitView, setElements} = useVueFlow({id: props.id});
    const edgeReplacer = ref({});
    const hiddenNodes = ref([]);
    const collapsed = ref([]);
    const clusterToNode = ref([])

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
            "message"
        ]
    )

    onMounted( () => {
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
            forwardEvent("loading", true);
            const elements = VueflowUtils.generateGraph(
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
                flowables()
            );
            setElements(elements);
            fitView();
            forwardEvent("loading", false);
        })
    }

    const forwardEvent = (type, payload) => {
        emit(type, payload);
    };

    // Graph interactions functions
    const onMouseOver = (node) => {
        if (!dragging.value) {
            VueFlowUtils.linkedElements(props.id, node.uid).forEach((n) => {
                if (n.type === "task") {
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

    onNodeDragStop((e) => {
        dragging.value = false;
        if (checkIntersections(e.intersections, e.node) === null) {
            const taskNode1 = e.node;
            // check multiple intersection with task
            const taskNode2 = e.intersections.find(n => n.type === "task");
            if (taskNode2) {
                try {
                    emit("swapped-task", YamlUtils.swapTasks(props.source, taskNode1.id, taskNode2.id))
                } catch (e) {
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

    onNodeDrag((e) => {
        resetNodesStyle();
        getNodes.value.filter(n => n.id !== e.node.id).forEach(n => {
            if (n.type === "trigger" || (n.type === "task" && YamlUtils.isParentChildrenRelation(props.source, n.id, e.node.id))) {
                n.style = {...n.style, opacity: "0.5"}
            } else {
                n.style = {...n.style, opacity: "1"}
            }
        })
        if (!checkIntersections(e.intersections, e.node) && e.intersections.filter(n => n.type === "task").length === 1) {
            e.intersections.forEach(n => {
                if (n.type === "task") {
                    n.style = {...n.style, outline: "0.5px solid " + cssVariable("--bs-primary")}
                    n.class = "rounded-3"
                }
            })
            e.node.style = {...e.node.style, outline: "0.5px solid " + cssVariable("--bs-primary")}
            e.node.class = "rounded-3"
        }
    })

    const checkIntersections = (intersections, node) => {
        const tasksMeet = intersections.filter(n => n.type === "task").map(n => n.id);
        if (tasksMeet.length > 1) {
            return "toomuchtaskerror";
        }
        if (tasksMeet.length === 1 && YamlUtils.isParentChildrenRelation(props.source, tasksMeet[0], node.id)) {
            return "parentchildrenerror";
        }
        if (intersections.filter(n => n.type === "trigger").length > 0) {
            return "triggererror";
        }
        return null;
    }

    const collapseCluster = (clusterUid, regenerate, recursive) => {

        const cluster = props.flowGraph.clusters.find(cluster => cluster.cluster.uid === clusterUid)
        const nodeId = clusterUid === "Triggers" ? "Triggers" : Utils.splitFirst(clusterUid, CLUSTER_UID_SEPARATOR);
        collapsed.value = collapsed.value.concat([nodeId])

        hiddenNodes.value = hiddenNodes.value.concat(cluster.nodes.filter(e => e !== nodeId || recursive));
        if (clusterUid !== "Triggers") {
            hiddenNodes.value = hiddenNodes.value.concat([cluster.cluster.uid])
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
        } else {
            edgeReplacer.value = {
                ...edgeReplacer.value,
                [cluster.start]: nodeId,
                [cluster.end]: nodeId
            }
        }

        if (regenerate) {
            generateGraph();
        }
    }

    const expand = (taskId) => {
        edgeReplacer.value = {}
        hiddenNodes.value = []
        clusterToNode.value = []
        collapsed.value = collapsed.value.filter(n => n != taskId)

        collapsed.value.forEach(n => collapseCluster(CLUSTER_UID_SEPARATOR + n, false, false))

        generateGraph();
    }

    const flowables = () => {
        return props.flowGraph && props.flowGraph.flowables ? props.flowGraph.flowables : [];
    }
</script>
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
        <Background />
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
                @edit="forwardEvent('edit', $event)"
                @delete="forwardEvent('delete', $event)"
                @expand="expand($event)"
                @open-link="forwardEvent('open-link', $event)"
                @show-logs="forwardEvent('show-logs', $event)"
                @show-description="forwardEvent('show-description', $event)"
                @mouseover="onMouseOver($event)"
                @mouseleave="onMouseLeave()"
                @add-error="forwardEvent('on-add-flowable-error', $event)"
            />
        </template>

        <template #node-trigger="triggerProps">
            <TriggerNode
                v-bind="triggerProps"
                :is-read-only="isReadOnly"
                :is-allowed-edit="isAllowedEdit"
                @delete="forwardEvent('delete', $event)"
                @edit="forwardEvent('edit', $event)"
                @show-description="forwardEvent('show-description', $event)"
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
                :flowables-ids="flowables"
                @add-task="forwardEvent('add-task', $event)"
                :is-read-only="isReadOnly"
                :is-allowed-edit="isAllowedEdit"
            />
        </template>

        <Controls :show-interactive="false">
            <ControlButton @click="forwardEvent('toggle-orientation', $event)" v-if="toggleOrientationButton">
                <SplitCellsVertical :size="48" v-if="!isHorizontal" />
                <SplitCellsHorizontal v-if="isHorizontal" />
            </ControlButton>
        </Controls>
    </VueFlow>
</template>

<style scoped lang="scss">

</style>