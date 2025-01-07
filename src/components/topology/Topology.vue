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
                @edit="forwardEvent(EVENTS.EDIT, $event)"
                @delete="forwardEvent(EVENTS.DELETE, $event)"
                @expand="expand($event)"
                @open-link="forwardEvent(EVENTS.OPEN_LINK, $event)"
                @show-logs="forwardEvent(EVENTS.SHOW_LOGS, $event)"
                @show-description="forwardEvent(EVENTS.SHOW_DESCRIPTION, $event)"
                @show-condition="forwardEvent(EVENTS.SHOW_CONDITION, $event)"
                @mouseover="onMouseOver($event)"
                @mouseleave="onMouseLeave()"
                @add-error="forwardEvent('on-add-flowable-error', $event)"
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
                @delete="forwardEvent(EVENTS.DELETE, $event)"
                @edit="forwardEvent(EVENTS.EDIT, $event)"
                @show-description="forwardEvent(EVENTS.SHOW_DESCRIPTION, $event)"
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
                @add-task="forwardEvent(EVENTS.ADD_TASK, $event)"
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
<script setup>
    import {computed, nextTick, onMounted, ref, watch} from "vue";
    import {ClusterNode, CollapsedClusterNode, DotNode, EdgeNode, TaskNode, TriggerNode} from "../index.js";
    import {useVueFlow, VueFlow} from "@vue-flow/core";
    import {ControlButton, Controls} from "@vue-flow/controls";
    import SplitCellsVertical from "../../assets/icons/SplitCellsVertical.vue";
    import SplitCellsHorizontal from "../../assets/icons/SplitCellsHorizontal.vue";
    import {cssVariable} from "../../utils/global";
    import {VueFlowUtils, YamlUtils} from "../../index";
    import {CLUSTER_PREFIX, EVENTS} from "../../utils/constants.js";
    import {Background} from "@vue-flow/background";
    import Utils from "../../utils/Utils.js";

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
    const lastPosition = ref(null)
    const {getNodes, onNodeDrag, onNodeDragStart, onNodeDragStop, fitView, setElements} = useVueFlow({id: props.id});
    const edgeReplacer = ref({});
    const hiddenNodes = ref([]);
    const collapsed = ref(new Set());
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
            forwardEvent("loading", true);

            // Workaround due to start & end nodes regeneration when fetching the graph again
            const oldCollapsed = collapsed.value;
            collapsed.value = new Set();
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

    onNodeDragStop((e) => {
        dragging.value = false;
        if (checkIntersections(e.intersections, e.node) === null) {
            const taskNode1 = e.node;
            // check multiple intersection with task
            const taskNode2 = e.intersections.find(n => n.type === "task");
            if (taskNode2) {
                try {
                    emit("swapped-task", {
                        newSource: YamlUtils.swapTasks(props.source, Utils.afterLastDot(taskNode1.id), Utils.afterLastDot(taskNode2.id)),
                        swappedTasks: [taskNode1.id, taskNode2.id]
                    })
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

    const subflowPrefixes = computed(() => {
        if(!props.flowGraph?.clusters) {
            return [];
        }

        return props.flowGraph.clusters.filter(cluster => cluster.cluster.type.endsWith("SubflowGraphCluster"))
            .map(cluster => cluster.cluster.taskNode.uid + ".");
    })

    onNodeDrag((e) => {
        resetNodesStyle();
        getNodes.value.filter(n => n.id !== e.node.id).forEach(n => {
            if (n.type === "trigger" || (n.type === "task" && (n.id.startsWith(e.node.id + ".") || e.node.id.startsWith(n.id + "."))) || subflowPrefixes?.value?.some(subflowPrefix => n.id.startsWith(subflowPrefix))) {
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
        const tasksMeet = intersections.filter(n => n.type === "task").map(n => Utils.afterLastDot(n.id));
        if (tasksMeet.length > 1) {
            return "toomuchtaskerror";
        }
        try {
            if (tasksMeet.length === 1 && YamlUtils.isParentChildrenRelation(props.source, Utils.afterLastDot(tasksMeet[0]), Utils.afterLastDot(node.id))) {
                return "parentchildrenerror";
            }
        } catch {
            return "parentchildrenerror";
        }
        if (intersections.filter(n => n.type === "trigger").length > 0) {
            return "triggererror";
        }
        return null;
    }

    const collapseCluster = (clusterUid, regenerate, recursive) => {
        const cluster = props.flowGraph.clusters.find(cluster => cluster.cluster.uid.endsWith(clusterUid));
        const nodeId = clusterUid.replace(CLUSTER_PREFIX, "");
        collapsed.value.add(nodeId)

        hiddenNodes.value = hiddenNodes.value.concat(cluster.nodes.filter(e => e !== nodeId || recursive));
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

        if (regenerate) {
            generateGraph();
        }
    }

    const expand = (expandData) => {
        const taskTypesWithSubflows = [
            "io.kestra.core.tasks.flows.Flow", "io.kestra.core.tasks.flows.Subflow", "io.kestra.plugin.core.flow.Subflow",
            "io.kestra.core.tasks.flows.ForEachItem$ForEachItemExecutable", "io.kestra.plugin.core.flow.ForEachItem$ForEachItemExecutable"
        ];
        if (taskTypesWithSubflows.includes(expandData.type) && !props.expandedSubflows.includes(expandData.id)) {
            forwardEvent("expand-subflow", [...props.expandedSubflows, expandData.id]);
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

</script>

<style scoped lang="scss">
    :deep(.unused-path) {
        opacity: 0.3;
    }
</style>
