import {MarkerType, Position, useVueFlow} from "@vue-flow/core"
import dagre from "dagre";
import {YamlUtils} from "../index.js";
import Utils from "./Utils.js";

export default class VueFlowUtils {

    static predecessorsEdge(vueFlowId, nodeUid) {
        const {getEdges} = useVueFlow({id: vueFlowId});

        let nodes = [];

        for (const edge of getEdges.value) {
            if (edge.target === nodeUid) {
                nodes.push(edge)
                let recursiveEdge = this.predecessorsEdge(vueFlowId, edge.source);
                if (recursiveEdge.length > 0) {
                    nodes.push(...recursiveEdge);
                }
            }
        }

        return nodes;
    }

    static successorsEdge(vueFlowId, nodeUid) {
        const {getEdges} = useVueFlow({id: vueFlowId});

        let nodes = [];

        for (const edge of getEdges.value) {
            if (edge.source === nodeUid) {
                nodes.push(edge)
                let recursiveEdge = this.successorsEdge(vueFlowId, edge.target);
                if (recursiveEdge.length > 0) {
                    nodes.push(...recursiveEdge);
                }
            }
        }

        return nodes;
    }

    static predecessorsNode(vueFlowId, nodeUid) {
        const {getEdges, findNode} = useVueFlow({id: vueFlowId});

        let nodes = [findNode(nodeUid)];

        for (const edge of getEdges.value) {
            if (edge.target === nodeUid) {
                nodes.push(edge.sourceNode)
                let recursiveEdge = this.predecessorsNode(vueFlowId, edge.source);
                if (recursiveEdge.length > 0) {
                    nodes.push(...recursiveEdge);
                }
            }
        }

        return nodes;
    }

    static successorsNode(vueFlowId, nodeUid) {
        const {getEdges, findNode} = useVueFlow({id: vueFlowId});

        let nodes = [findNode(nodeUid)];

        for (const edge of getEdges.value) {
            if (edge.source === nodeUid) {
                nodes.push(edge.targetNode)
                let recursiveEdge = this.successorsNode(vueFlowId, edge.target);
                if (recursiveEdge.length > 0) {
                    nodes.push(...recursiveEdge);
                }
            }
        }

        return nodes;
    }

    static linkedElements(vueFlowId, nodeUid) {
        return ([
            ...this.predecessorsEdge(vueFlowId, nodeUid),
            ...this.predecessorsNode(vueFlowId, nodeUid),
            ...this.successorsEdge(vueFlowId, nodeUid),
            ...this.successorsNode(vueFlowId, nodeUid),
        ])
    }

    static generateDagreGraph(flowGraph, hiddenNodes, isHorizontal, clusterCollapseToNode, edgeReplacer, collapsed, clusterToNode) {
        const dagreGraph = new dagre.graphlib.Graph({compound: true})
        dagreGraph.setDefaultEdgeLabel(() => ({}))
        dagreGraph.setGraph({rankdir: isHorizontal ? "LR" : "TB"})

        for (const node of flowGraph.nodes) {
            if (!hiddenNodes.includes(node.uid)) {
                dagreGraph.setNode(node.uid, {
                    width: this.getNodeWidth(node),
                    height: this.getNodeHeight(node)
                })
            }
        }

        for (let cluster of (flowGraph.clusters || [])) {
            if (clusterCollapseToNode.includes(cluster.cluster.uid) && collapsed.includes(cluster.cluster.uid)) {
                const node = {uid: cluster.cluster.uid, type: "collapsedcluster"};
                dagreGraph.setNode(cluster.cluster.uid, {
                    width: this.getNodeWidth(node),
                    height: this.getNodeHeight(node)
                });
                clusterToNode.push(node)
                continue
            }
            if (!edgeReplacer[cluster.cluster.uid]) {
                dagreGraph.setNode(cluster.cluster.uid, {clusterLabelPos: "top"});

                for (let node of (cluster.nodes || [])) {
                    if (!hiddenNodes.includes(node)) {
                        dagreGraph.setParent(node, cluster.cluster.uid)
                    }
                }
            }
            if (cluster.parents) {
                const nodeChild = edgeReplacer[cluster.cluster.uid] ? edgeReplacer[cluster.cluster.uid] : cluster.cluster.uid
                if (!hiddenNodes.includes(nodeChild)) {
                    dagreGraph.setParent(nodeChild, cluster.parents[cluster.parents.length - 1]);
                }
            }
        }

        for (const edge of (flowGraph.edges || [])) {
            const newEdge = this.replaceIfCollapsed(edge.source, edge.target, edgeReplacer, hiddenNodes);
            if (newEdge) {
                dagreGraph.setEdge(newEdge.source, newEdge.target)
            }
        }

        dagre.layout(dagreGraph)
        return dagreGraph;
    }

    static getNodePosition(n, parent) {
        const position = {x: n.x - n.width / 2, y: n.y - n.height / 2};

        // bug with parent node,
        if (parent) {
            const parentPosition = this.getNodePosition(parent);
            position.x = position.x - parentPosition.x;
            position.y = position.y - parentPosition.y;
        }
        return position;
    }

    static getNodeWidth(node) {
        return this.isTaskNode(node) || this.isTriggerNode(node) ? 184 : this.isCollapsedCluster(node) ? 150 : 5;
    }

    static getNodeHeight(node) {
        return this.isTaskNode(node) || this.isTriggerNode(node) ? 44 : this.isCollapsedCluster(node) ? 44 : 5;
    }

    static isTaskNode(node) {
        return node.task !== undefined && (node.type === "io.kestra.core.models.hierarchies.GraphTask")
    }

    static isTriggerNode(node) {
        return node.trigger !== undefined && (node.type === "io.kestra.core.models.hierarchies.GraphTrigger");
    }

    static isCollapsedCluster(node) {
        return node.type === "collapsedcluster";
    }

    static replaceIfCollapsed(source, target, edgeReplacer, hiddenNodes) {
        const newSource = edgeReplacer[source] ? edgeReplacer[source] : source
        const newTarget = edgeReplacer[target] ? edgeReplacer[target] : target

        if (newSource === newTarget || (hiddenNodes.includes(newSource) || hiddenNodes.includes(newTarget))) {
            return null;
        }
        return {target: newTarget, source: newSource}
    }

    static cleanGraph(vueflowId) {
        const {
            getEdges,
            getNodes,
            getElements,
            removeEdges,
            removeNodes,
            removeSelectedElements
        } = useVueFlow({id: vueflowId});
        removeEdges(getEdges.value)
        removeNodes(getNodes.value)
        removeSelectedElements(getElements.value)
    }

    static flowHaveTasks(source) {
        return source ? YamlUtils.flowHaveTasks(source) : false;
    }

    static linkDatas(task, execution) {
        const data = {id: task.flowId, namespace: task.namespace}
        if (execution) {
            const taskrun = execution.taskRunList.find(r => r.taskId == task.id && r.outputs.executionId)
            if (taskrun) {
                data.executionId = taskrun.outputs.executionId
            }
        }
        return data
    }

    static nodeColor(node, collapsed, flowSource) {
        if (this.isTaskNode(node)) {
            if (collapsed.includes(node.uid)) {
                return "blue";
            }
            if (YamlUtils.isTaskError(flowSource, node.task.id)) {
                return "danger"
            }
            if (node.task.type === "io.kestra.core.tasks.flows.Flow") {
                return "primary"
            }
        } else if (this.isTriggerNode(node) || this.isCollapsedCluster(node)) {
            return "success";
        }
        return "default"
    }

    static getClusterTaskIdWithEndNodeUid (nodeUid, flowGraph) {
        const cluster = flowGraph.clusters.find(cluster => cluster.end === nodeUid);
        if (cluster) {
            return Utils.splitFirst(cluster.cluster.uid, "cluster_");
        }
        return undefined;
    }

    static haveAdd(edge, flowSource, flowGraph, flowables) {
        if (edge.target === YamlUtils.getFirstTask(flowSource)) {
            return [YamlUtils.getNextTaskId(edge.target, flowSource, flowGraph), "before"];
        }
        if (YamlUtils.isTaskParallel(edge.target, flowSource) || YamlUtils.isTrigger(flowSource, edge.target) || YamlUtils.isTrigger(flowSource, edge.source)) {
            return undefined;
        }
        if (YamlUtils.extractTask(flowSource, edge.source) && YamlUtils.extractTask(flowSource, edge.target)) {
            return [edge.source, "after"];
        }
        // Check if edge is an ending flowable
        // If true, enable add button to add a task
        // under the flowable task
        if (edge.source.endsWith("_end") && edge.target.endsWith("_end")) {
            // Cluster uid contains the flowable task id
            // So we look for the cluster having this end edge
            // to return his flowable id
            return [this.getClusterTaskIdWithEndNodeUid(edge.source, flowGraph), "after"];
        }
        if (flowables.includes(edge.source)) {
            return [YamlUtils.getNextTaskId(edge.target, flowSource, flowGraph), "before"];
        }
        if (YamlUtils.extractTask(flowSource, edge.source) && edge.target.endsWith("_end")) {
            return [edge.source, "after"];
        }
        if (YamlUtils.extractTask(flowSource, edge.source) && edge.target.endsWith("_start")) {
            return [edge.source, "after"];
        }
        if (YamlUtils.extractTask(flowSource, edge.target) && edge.source.endsWith("_end")) {
            return [edge.target, "before"];
        }

        return undefined;
    }

    static getEdgeColor(edge, flowSource) {
        if (YamlUtils.isTaskError(flowSource, edge.source) || YamlUtils.isTaskError(flowSource, edge.target)) {
            return "danger"
        }
        return null;
    }

    static generateGraph(vueFlowId, flowId, namespace, flowGraph, flowSource, hiddenNodes, isHorizontal, edgeReplacer, collapsed, clusterToNode, isReadOnly, isAllowedEdit, flowables) {
        const elements = [];

        const clusterCollapseToNode = ["Triggers"];

        if (!flowGraph || !this.flowHaveTasks(flowSource)) {
            elements.push({
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
            elements.push({
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
            elements.push({
                id: "start|end",
                source: "start",
                target: "end",
                type: "edge",
                data: {
                    edge: {
                        relation: {
                            relationType: "SEQUENTIAL"
                        }
                    },
                    isFlowable: false,
                    initTask: true,
                    color: "primary"
                }
            })

            return;
        }
        const dagreGraph = this.generateDagreGraph(flowGraph, hiddenNodes, isHorizontal, clusterCollapseToNode, edgeReplacer, collapsed, clusterToNode);
        const clusters = {};
        for (let cluster of (flowGraph.clusters || [])) {
            if (!edgeReplacer[cluster.cluster.uid] && !collapsed.includes(cluster.cluster.uid)) {
                for (let nodeUid of cluster.nodes) {
                    clusters[nodeUid] = cluster.cluster;
                }

                const clusterUid = cluster.cluster.uid;
                const dagreNode = dagreGraph.node(clusterUid)
                const parentNode = cluster.parents ? cluster.parents[cluster.parents.length - 1] : undefined;

                elements.push({
                    id: clusterUid,
                    type: "cluster",
                    parentNode: parentNode,
                    position: this.getNodePosition(dagreNode, parentNode ? dagreGraph.node(parentNode) : undefined),
                    style: {
                        width: clusterUid === "Triggers" && isHorizontal ? "350px" : dagreNode.width + "px",
                        height: clusterUid === "Triggers" && !isHorizontal ? "180px" : dagreNode.height + "px"
                    },
                    data: {
                        collapsable: true,
                        color: clusterUid === "Triggers" ? "success" : "blue"
                    },
                    class: `bg-light-${clusterUid === "Triggers" ? "success" : "blue"}-border rounded p-2`,
                })
            }
        }

        let disabledLowCode = [];
        for (const node of flowGraph.nodes.concat(clusterToNode)) {
            if (!hiddenNodes.includes(node.uid)) {
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
                } else if (node.type === "collapsedcluster") {
                    nodeType = "collapsedcluster";
                }
                // Disable interaction for Dag task
                // because our low code editor can not handle it for now
                if (this.isTaskNode(node) && node.task.type === "io.kestra.core.tasks.flows.Dag") {
                    disabledLowCode.push(node.task.id);
                    YamlUtils.getChildrenTasks(flowSource, node.task.id).forEach(child => {
                        disabledLowCode.push(child);
                    })
                }

                const taskId = node?.task?.id;
                elements.push({
                    id: node.uid,
                    label: this.isTaskNode(node) ? taskId : "",
                    type: nodeType,
                    position: this.getNodePosition(dagreNode, clusters[node.uid] ? dagreGraph.node(clusters[node.uid].uid) : undefined),
                    style: {
                        width: this.getNodeWidth(node) + "px",
                        height: this.getNodeHeight(node) + "px"
                    },
                    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                    targetPosition: isHorizontal ? Position.Left : Position.Top,
                    parentNode: clusters[node.uid] ? clusters[node.uid].uid : undefined,
                    draggable: nodeType === "task" && !isReadOnly && this.isTaskNode(node) ? !disabledLowCode.includes(taskId) : false,
                    data: {
                        node: node,
                        namespace: namespace,
                        flowId: flowId,
                        isFlowable: this.isTaskNode(node) ? flowables.includes(taskId) : false,
                        color: nodeType != "dot" ? this.nodeColor(node, collapsed, flowSource) : null,
                        expandable: taskId ? flowables.includes(taskId) && edgeReplacer["cluster_" + taskId] !== undefined : this.isCollapsedCluster(node),
                        isReadOnly: isReadOnly,
                        link: node.task?.type === "io.kestra.core.tasks.flows.Flow" ? this.linkDatas(node.task) : false
                    },
                    class: node.type === "collapsedcluster" ? `bg-light-${node.uid === "Triggers" ? "success" : "blue"}-border rounded p-2` : "",
                })
            }
        }
        for (const edge of (flowGraph.edges || [])) {
            const newEdge = this.replaceIfCollapsed(edge.source, edge.target, edgeReplacer, hiddenNodes);
            if (newEdge) {
                elements.push({
                    id: newEdge.source + "|" + newEdge.target,
                    source: newEdge.source,
                    target: newEdge.target,
                    type: "edge",
                    markerEnd: YamlUtils.extractTask(flowSource, newEdge.target) ? {
                        id: "marker-custom",
                        type: MarkerType.ArrowClosed,
                    } : "",
                    data: {
                        haveAdd: this.haveAdd(edge, flowSource, flowGraph, flowables),
                        isFlowable: flowables.includes(edge.source) || flowables.includes(edge.target),
                        haveDashArray: YamlUtils.isTrigger(flowSource, edge.source) || YamlUtils.isTrigger(flowSource, edge.target),
                        nextTaskId: YamlUtils.getNextTaskId(edge.target, flowSource, flowGraph),
                        disabled: disabledLowCode.includes(edge.source) || isReadOnly || !isAllowedEdit,
                        color: this.getEdgeColor(edge, flowSource)
                    },
                    style: {
                        zIndex: 10,
                    }
                })
            }
        }
        return elements;
    }

}
