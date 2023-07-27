import YamlUtils from "./YamlUtils.js";
import {MarkerType, Position, useVueFlow} from "@vue-flow/core";
import dagre from "dagre";
import Utils from "./Utils.js";

// Vue flow methods to interact with Graph
const {
    id,
    getNodes,
    removeNodes,
    getEdges,
    removeEdges,
    fitView,
    getElements,
    removeSelectedElements,
} = useVueFlow();

export default class GraphUtils {
    // Graph generation methods
    static cleanGraph = () => {
        removeEdges(getEdges.value)
        removeNodes(getNodes.value)
        removeSelectedElements(getElements.value)
    }

    static generateGraph = (flowGraph, source, isHorizontal, isReadOnly, flowData) => {
        this.cleanGraph();
        // next tick
        emit("loading", true);
        try {
            const elements = [];
            if (!flowGraph || !flowHaveTasks(source)) {
                elements.value.push({
                    id: "start",
                    label: "",
                    type: "dot",
                    position: {x: 0, y: 0},
                    style: {
                        width: "5px",
                        height: "5px"
                    },
                    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                    targetPosition: isHorizontal ? Position.Left : Position.Top,
                    parentNode: undefined,
                    draggable: false,
                })
                elements.value.push({
                    id: "end",
                    label: "",
                    type: "dot",
                    position: isHorizontal ? {x: 50, y: 0} : {x: 0, y: 50},
                    style: {
                        width: "5px",
                        height: "5px"
                    },
                    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                    targetPosition: isHorizontal ? Position.Left : Position.Top,
                    parentNode: undefined,
                    draggable: false,
                })
                elements.value.push({
                    id: "start|end",
                    source: "start",
                    target: "end",
                    type: "edge",
                    markerEnd: MarkerType.ArrowClosed,
                    data: {
                        edge: {
                            relation: {
                                relationType: "SEQUENTIAL"
                            }
                        },
                        isFlowable: false,
                        initTask: true,
                    }
                })

                emit("loading", false);
                return;
            }
            const dagreGraph = this.generateDagreGraph(flowGraph);
            const clusters = {};
            for (let cluster of (flowGraph.clusters || [])) {
                for (let nodeUid of cluster.nodes) {
                    clusters[nodeUid] = cluster.cluster;
                }

                const dagreNode = dagreGraph.node(cluster.cluster.uid)
                const parentNode = cluster.parents ? cluster.parents[cluster.parents.length - 1] : undefined;

                const clusterUid = cluster.cluster.uid;
                elements.value.push({
                    id: clusterUid,
                    label: clusterUid,
                    type: "cluster",
                    parentNode: parentNode,
                    position: this.getNodePosition(dagreNode, parentNode ? dagreGraph.node(parentNode) : undefined),
                    style: {
                        width: clusterUid === "Triggers" && isHorizontal ? "400px" : dagreNode.width + "px",
                        height: clusterUid === "Triggers" && !isHorizontal ? "250px" : dagreNode.height + "px",
                    },
                })
            }

            let disabledLowCode = [];

            for (const node of flowGraph.nodes) {
                const dagreNode = dagreGraph.node(node.uid);
                let nodeType = "task";
                if (node.type.includes("GraphClusterEnd")) {
                    nodeType = "dot";
                } else if (clusters[node.uid] === undefined && node.type.includes("GraphClusterRoot")) {
                    nodeType = "dot";
                } else if (node.type.includes("GraphClusterRoot")) {
                    nodeType = "dot";
                } else if (node.type.includes("GraphTrigger")) {
                    nodeType = "trigger";
                }
                // Disable interaction for Dag task
                // because our low code editor can not handle it for now
                if (this.isTaskNode(node) && node.task.type === "io.kestra.core.tasks.flows.Dag") {
                    disabledLowCode.push(node.task.id);
                    YamlUtils.getChildrenTasks(source, node.task.id).forEach(child => {
                        disabledLowCode.push(child);
                    })
                }

                elements.value.push({
                    id: node.uid,
                    label: this.isTaskNode(node) ? node.task.id : "",
                    type: nodeType,
                    position: this.getNodePosition(dagreNode, clusters[node.uid] ? dagreGraph.node(clusters[node.uid].uid) : undefined),
                    style: {
                        width: this.getNodeWidth(node) + "px",
                        height: this.getNodeHeight(node) + "px"
                    },
                    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                    targetPosition: isHorizontal ? Position.Left : Position.Top,
                    parentNode: clusters[node.uid] ? clusters[node.uid].uid : undefined,
                    draggable: nodeType === "task" && !isReadOnly && this.isTaskNode(node) ? !disabledLowCode.includes(node.task.id) : false,
                    data: {
                        node: node,
                        namespace: flowData.namespace,
                        flowId: flowData.flowId,
                        revision: flowData.execution ? flowData.execution.flowRevision : undefined,
                        isFlowable: this.isTaskNode(node) ? (flowGraph && flowGraph.flowables ? flowGraph.flowables : []).includes(node.task.id) : false
                    },
                })
            }

            for (const edge of flowGraph.edges) {
                elements.value.push({
                    id: edge.source + "|" + edge.target,
                    source: edge.source,
                    target: edge.target,
                    type: "edge",
                    markerEnd: MarkerType.ArrowClosed,
                    data: {
                        edge: edge,
                        haveAdd: complexEdgeHaveAdd(edge),
                        isFlowable: flowables().includes(edge.source) || flowables().includes(edge.target),
                        nextTaskId: getNextTaskId(edge.target),
                        disabled: disabledLowCode.includes(edge.source)
                    }
                })
            }
            return elements;
        } catch (e) {
            console.error("Error while creating topology graph: " + e);
        } finally {
            emit("loading", false);
        }
    }

    static getFirstTaskId = (source) => {
        return YamlUtils.getFirstTask(source);
    }

    static getNextTaskId = (target, source, edges) => {
        while (YamlUtils.extractTask(source, target) === undefined) {
            const edge = edges.find(e => e.source === target)
            if (!edge) {
                return null
            }
            target = edge.target
        }
        return target
    }

    static generateDagreGraph = (flowGraph) => {
        const dagreGraph = new dagre.graphlib.Graph({compound: true})
        dagreGraph.setDefaultEdgeLabel(() => ({}))
        dagreGraph.setGraph({rankdir: isHorizontal.value ? "LR" : "TB"})

        for (const node of flowGraph.nodes) {
            dagreGraph.setNode(node.uid, {
                width: this.getNodeWidth(node),
                height: this.getNodeHeight(node)
            })
        }

        for (const edge of flowGraph.edges) {
            dagreGraph.setEdge(edge.source, edge.target)
        }

        for (let cluster of (flowGraph.clusters || [])) {
            dagreGraph.setNode(cluster.cluster.uid, {clusterLabelPos: "top"});

            if (cluster.parents) {
                dagreGraph.setParent(cluster.cluster.uid, cluster.parents[cluster.parents.length - 1]);
            }

            for (let node of (cluster.nodes || [])) {
                dagreGraph.setParent(node, cluster.cluster.uid)
            }
        }
        dagre.layout(dagreGraph)
        return dagreGraph;
    }

    static getNodePosition = (n, parent) => {
        const position = {x: n.x - n.width / 2, y: n.y - n.height / 2};

        // bug with parent node,
        if (parent) {
            const parentPosition = this.getNodePosition(parent);
            position.x = position.x - parentPosition.x;
            position.y = position.y - parentPosition.y;
        }
        return position;
    };

    static getNodeWidth = (node) => {
        return this.isTaskNode(node) || this.isTriggerNode(node) ? 202 : 5;
    };

    static getNodeHeight = (node, isHorizontal) => {
        return this.isTaskNode(node) || this.isTriggerNode(node) ? 55 : (isHorizontal ? 55 : 5);
    };

    static isTaskNode = (node) => {
        return node.task !== undefined && (node.type === "io.kestra.core.models.hierarchies.GraphTask" || node.type === "io.kestra.core.models.hierarchies.GraphClusterRoot")
    };

    static isTriggerNode = (node) => {
        return node.trigger !== undefined && (node.type === "io.kestra.core.models.hierarchies.GraphTrigger");
    }


    static complexEdgeHaveAdd = (edge) => {
        // Check if edge is an ending flowable
        // If true, enable add button to add a task
        // under the flowable task
        const isEndtoEndEdge = edge.source.includes("_end") && edge.target.includes("_end")
        if (isEndtoEndEdge) {
            // Cluster uid contains the flowable task id
            // So we look for the cluster having this end edge
            // to return his flowable id
            return [getClusterTaskIdWithEndNodeUid(edge.source), "after"];
        }
        if (this.isLinkToFirstFlowableTask(edge)) {
            return [this.getFirstTaskId(), "before"];
        }

        return undefined;
    }

    static getClusterTaskIdWithEndNodeUid = (flowGraph, nodeUid) => {
        const cluster = flowGraph.clusters.find(cluster => cluster.end === nodeUid);
        if (cluster) {
            return Utils.splitFirst(cluster.cluster.uid, "cluster_");
        }

        return undefined;
    }

    static isLinkToFirstFlowableTask = (edge) => {
        const firstTaskId = this.getFirstTaskId();

        return flowables().includes(firstTaskId) && edge.target === firstTaskId;
    }

    // Graph interactions functions
    static onMouseOver = (node) => {
        if (!dragging.value) {
            linkedElements(id, node.uid).forEach((n) => {
                if (n.type === "task") {
                    n.style = {...n.style, outline: "0.5px solid " + cssVariable("--bs-yellow")}
                }
            });
        }

    }

    static onMouseLeave = () => {
        resetNodesStyle();
    }

    static resetNodesStyle = () => {
        getNodes.value.filter(n => n.type === "task" || n.type === " trigger")
            .forEach(n => {
                n.style = {...n.style, opacity: "1", outline: "none"}
            })
    }

    //onNodeDragStart((e) => {
    //     dragging.value = true;
    //     resetNodesStyle();
    //     e.node.style = {...e.node.style, zIndex: 1976}
    //     lastPosition.value = e.node.position;
    // })
    //
    // onNodeDragStop((e) => {
    //     dragging.value = false;
    //     if (checkIntersections(e.intersections, e.node) === null) {
    //         const taskNode1 = e.node;
    //         // check multiple intersection with task
    //         const taskNode2 = e.intersections.find(n => n.type === "task");
    //         if (taskNode2) {
    //             try {
    //                 emit("on-edit", YamlUtils.swapTasks(props.source, taskNode1.id, taskNode2.id))
    //             } catch (e) {
    //                 store.dispatch("core/showMessage", {
    //                     variant: "error",
    //                     title: t("cannot swap tasks"),
    //                     message: t(e.message, e.messageOptions)
    //                 });
    //                 taskNode1.position = lastPosition.value;
    //             }
    //         } else {
    //             taskNode1.position = lastPosition.value;
    //         }
    //     } else {
    //         e.node.position = lastPosition.value;
    //     }
    //     resetNodesStyle();
    //     e.node.style = {...e.node.style, zIndex: 1}
    //     lastPosition.value = null;
    // })
    //
    // onNodeDrag((e) => {
    //     resetNodesStyle();
    //     getNodes.value.filter(n => n.id !== e.node.id).forEach(n => {
    //         if (n.type === "trigger" || (n.type === "task" && YamlUtils.isParentChildrenRelation(props.source, n.id, e.node.id))) {
    //             n.style = {...n.style, opacity: "0.5"}
    //         } else {
    //             n.style = {...n.style, opacity: "1"}
    //         }
    //     })
    //     if (!checkIntersections(e.intersections, e.node) && e.intersections.filter(n => n.type === "task").length === 1) {
    //         e.intersections.forEach(n => {
    //             if (n.type === "task") {
    //                 n.style = {...n.style, outline: "0.5px solid " + cssVariable("--bs-primary")}
    //             }
    //         })
    //         e.node.style = {...e.node.style, outline: "0.5px solid " + cssVariable("--bs-primary")}
    //     }
    // })

    static checkIntersections = (intersections, node) => {
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

    static toggleOrientation = (isHorizontal) => {
        localStorage.setItem(
            "topology-orientation",
            localStorage.getItem("topology-orientation") !== "0" ? "0" : "1"
        );
        isHorizontal = localStorage.getItem("topology-orientation") === "1";
        // emit an event
        this.generateGraph();
        fitView();
    }

    // Flow check functions
    static flowHaveTasks = (source) => {
        return source ? YamlUtils.flowHaveTasks(source) : false;
    }

}