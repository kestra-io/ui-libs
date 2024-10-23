import {MarkerType, Position, useVueFlow} from "@vue-flow/core"
import dagre from "dagre";
import {YamlUtils} from "../index.js";
import Utils from "./Utils.js";
import {CLUSTER_PREFIX, NODE_SIZES} from "./constants.js";

const TRIGGERS_NODE_UID = "root.Triggers";
export default class VueFlowUtils {

    static predecessorsEdge(vueFlowId, nodeUid) {
        const {getEdges} = useVueFlow(vueFlowId);

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
        const {getEdges} = useVueFlow(vueFlowId);

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
        const {getEdges, findNode} = useVueFlow(vueFlowId);

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
        const {getEdges, findNode} = useVueFlow(vueFlowId);

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

    static generateDagreGraph(flowGraph, hiddenNodes, isHorizontal, clustersWithoutRootNode, edgeReplacer, collapsed, clusterToNode) {
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
            const nodeUid = cluster.cluster.uid.replace(CLUSTER_PREFIX, "");
            if (clustersWithoutRootNode.includes(cluster.cluster.uid) && collapsed.has(nodeUid)) {
                const node = {uid: nodeUid, type: "collapsedcluster"};
                dagreGraph.setNode(nodeUid, {
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
        return this.isTaskNode(node) || this.isTriggerNode(node) ? NODE_SIZES.TASK_WIDTH : this.isCollapsedCluster(node) ? NODE_SIZES.COLLAPSED_CLUSTER_WIDTH : NODE_SIZES.DOT_WIDTH;
    }

    static getNodeHeight(node) {
        return this.isTaskNode(node) || this.isTriggerNode(node) ? NODE_SIZES.TASK_HEIGHT : this.isCollapsedCluster(node) ? NODE_SIZES.COLLAPSED_CLUSTER_HEIGHT : NODE_SIZES.DOT_HEIGHT;
    }

    static isTaskNode(node) {
        return ["GraphTask", "SubflowGraphTask"].some(t => node.type.endsWith(t));
    }

    static isTriggerNode(node) {
        return node.type.endsWith("GraphTrigger");
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
        } = useVueFlow(vueflowId);
        removeEdges(getEdges.value)
        removeNodes(getNodes.value)
        removeSelectedElements(getElements.value)
    }

    static flowHaveTasks(source) {
        return source ? YamlUtils.flowHaveTasks(source) : false;
    }

    static nodeColor(node, collapsed) {
        if (node.uid === TRIGGERS_NODE_UID) {
            return "success";
        }

        if (node.type === "dot") {
            return null;
        }

        if (this.isTriggerNode(node) || this.isCollapsedCluster(node)) {
            return "success";
        }

        if (node.type.endsWith("SubflowGraphTask")) {
            return "primary";
        }
        if (node.error) {
            return "danger";
        }
        if (collapsed.has(node.uid)) {
            return "blue";
        }

        return "default";
    }

    static haveAdd(edge, nodeByUid, clustersRootTaskUids, readOnlyUidPrefixes) {
        // prevent subflow edit (edge = subflowNode -> subflowNode)
        if(readOnlyUidPrefixes.some(prefix => edge.source.startsWith(prefix) && edge.target.startsWith(prefix))) {
            return undefined;
        }

        // edge = clusterRoot -> clusterRootTask
        if (clustersRootTaskUids.includes(edge.target)) {
            return undefined;
        }

        // edge = Triggers cluster -> something || edge = something -> Triggers cluster
        if(edge.source.startsWith(TRIGGERS_NODE_UID) || edge.target.startsWith(TRIGGERS_NODE_UID)) {
            return undefined;
        }

        const dotSplitTarget = edge.target.split(".");
        dotSplitTarget.pop();
        const targetNodeClusterUid = dotSplitTarget.join(".");
        const clusterRootTaskId = Utils.afterLastDot(targetNodeClusterUid);

        // edge = task of parallel -> end of parallel, we only add + symbol right after the parallel cluster root task node
        const targetNode = nodeByUid[edge.target];
        if(targetNode.type.endsWith("GraphClusterEnd") && nodeByUid[targetNodeClusterUid]?.task?.type?.endsWith("Parallel")) {
            return undefined;
        }

        // edge = something -> clusterRoot ==> we insert before the cluster
        // clusterUid = clusterTraversalPrefix.{rootTaskUid}
        // clusterRoot.uid = clusterUid.someUid = clusterTraversalPrefix.{rootTaskUid}.someUid
        if(targetNode.type.endsWith("GraphClusterRoot")) {
            return [clusterRootTaskId, "before"];
        }

        const sourceIsEndOfCluster = nodeByUid[edge.source].type.endsWith("GraphClusterEnd");
        // edge = clusterTask -> clusterEnd ==> we insert after the previous task
        if(!sourceIsEndOfCluster && targetNode.type.endsWith("GraphClusterEnd")) {
            return [Utils.afterLastDot(edge.source), "after"]
        }

        // edge = cluster1End -> something ==> we insert after cluster1
        if(sourceIsEndOfCluster) {
            const dotSplitSource = edge.source.split(".");
            return [dotSplitSource[dotSplitSource.length - 2], "after"];
        }

        return [Utils.afterLastDot(edge.target), "before"];
    }

    static getEdgeColor(edge, nodeByUid) {
        const sourceNode = nodeByUid[edge.source];
        const targetNode = nodeByUid[edge.target];
        if (sourceNode.error && targetNode.error) {
            return "danger"
        }

        if (sourceNode.type.endsWith("GraphClusterRoot") && targetNode.error) {
            return "danger"
        }

        if (sourceNode.error && targetNode.type.endsWith("GraphClusterEnd")) {
            return "danger"
        }

        return null;
    }

    static generateGraph(vueFlowId, flowId, namespace, flowGraph, flowSource, hiddenNodes, isHorizontal, edgeReplacer, collapsed, clusterToNode, isReadOnly, isAllowedEdit, enableSubflowInteraction) {
        const elements = [];

        const clustersWithoutRootNode = [CLUSTER_PREFIX + TRIGGERS_NODE_UID];

        if (!flowGraph || (flowSource && !this.flowHaveTasks(flowSource))) {
            elements.push({
                id: "start",
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
                type: "bezier",
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

        const dagreGraph = this.generateDagreGraph(flowGraph, hiddenNodes, isHorizontal, clustersWithoutRootNode, edgeReplacer, collapsed, clusterToNode);

        const clusterByNodeUid = {};
        const clusters = flowGraph.clusters || [];
        const rawClusters = clusters.map(c => c.cluster);
        const readOnlyUidPrefixes = rawClusters.filter(c => c.type.endsWith("SubflowGraphCluster")).map(c => c.taskNode.uid);

        const nodeByUid = Object.fromEntries(flowGraph.nodes.concat(clusterToNode).map(node => [node.uid, node]));
        for (let cluster of clusters) {
            if (!edgeReplacer[cluster.cluster.uid] && !collapsed.has(cluster.cluster.uid)) {
                if (cluster.cluster.taskNode?.task?.type === "io.kestra.core.tasks.flows.Dag") {
                    readOnlyUidPrefixes.push(cluster.cluster.taskNode.uid);
                }

                for (let nodeUid of cluster.nodes) {
                    clusterByNodeUid[nodeUid] = cluster.cluster;
                }

                const clusterUid = cluster.cluster.uid;
                const dagreNode = dagreGraph.node(clusterUid)
                const parentNode = cluster.parents ? cluster.parents[cluster.parents.length - 1] : undefined;

                const clusterColor = this.computeClusterColor(cluster.cluster);

                elements.push({
                    id: clusterUid,
                    type: "cluster",
                    parentNode: parentNode,
                    position: this.getNodePosition(dagreNode, parentNode ? dagreGraph.node(parentNode) : undefined),
                    style: {
                        width: clusterUid === TRIGGERS_NODE_UID && isHorizontal ? NODE_SIZES.TRIGGER_CLUSTER_WIDTH + "px" : dagreNode.width + "px",
                        height: clusterUid === TRIGGERS_NODE_UID && !isHorizontal ? NODE_SIZES.TRIGGER_CLUSTER_HEIGHT + "px" : dagreNode.height + "px"
                    },
                    data: {
                        collapsable: true,
                        color: clusterColor,
                        taskNode: cluster.cluster.taskNode,
                        unused: cluster.cluster.taskNode ? nodeByUid[cluster.cluster.taskNode.uid].unused : false
                    },
                    class: `bg-light-${clusterColor}-border rounded p-2`,
                })
            }
        }

        for (const node of flowGraph.nodes.concat(clusterToNode)) {
            if (!hiddenNodes.includes(node.uid)) {
                const dagreNode = dagreGraph.node(node.uid);
                let nodeType = "task";
                if (this.isClusterRootOrEnd(node)) {
                    nodeType = "dot";
                } else if (node.type.includes("GraphTrigger")) {
                    nodeType = "trigger";
                } else if (node.type === "collapsedcluster") {
                    nodeType = "collapsedcluster";
                }

                const color = this.nodeColor(node, collapsed);
                // If task type includes '$', it's an inner class so it's probably an internal class not supposed to be editable
                // In such case, only the root task will be editable
                const isReadOnlyTask = isReadOnly || node.task?.type?.includes("$") || readOnlyUidPrefixes.some(prefix => node.uid.startsWith(prefix + "."));
                elements.push({
                    id: node.uid,
                    type: nodeType,
                    position: this.getNodePosition(dagreNode, clusterByNodeUid[node.uid] ? dagreGraph.node(clusterByNodeUid[node.uid].uid) : undefined),
                    style: {
                        width: this.getNodeWidth(node) + "px",
                        height: this.getNodeHeight(node) + "px"
                    },
                    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                    targetPosition: isHorizontal ? Position.Left : Position.Top,
                    parentNode: clusterByNodeUid[node.uid] ? clusterByNodeUid[node.uid].uid : undefined,
                    draggable: nodeType === "task" ? !isReadOnlyTask : false,
                    data: {
                        node: node,
                        namespace: clusterByNodeUid[node.uid]?.taskNode?.task?.namespace ?? namespace,
                        flowId: clusterByNodeUid[node.uid]?.taskNode?.task?.flowId ?? flowId,
                        isFlowable: clusterByNodeUid[node.uid]?.uid === CLUSTER_PREFIX + node.uid && !node.type.endsWith("SubflowGraphTask"),
                        color: color,
                        expandable: this.isExpandableTask(node, clusterByNodeUid, edgeReplacer, enableSubflowInteraction),
                        isReadOnly: isReadOnlyTask,
                        iconComponent: this.isCollapsedCluster(node) ? "lightning-bolt" : null,
                        executionId: node.executionId,
                        unused: node.unused
                    },
                    class: node.type === "collapsedcluster" ? `bg-light-${color}-border rounded` : "",
                })
            }
        }

        const clusterRootTaskNodeUids = rawClusters.filter(c => c.taskNode).map(c => c.taskNode.uid);
        const edges = flowGraph.edges ?? [];

        for (const edge of edges) {
            const newEdge = this.replaceIfCollapsed(edge.source, edge.target, edgeReplacer, hiddenNodes);
            if (newEdge) {
                elements.push({
                    id: newEdge.source + "|" + newEdge.target,
                    source: newEdge.source,
                    target: newEdge.target,
                    type: "bezier",
                    markerEnd: this.isClusterRootOrEnd(nodeByUid[newEdge.target]) ? ""
                        : {
                            id: nodeByUid[newEdge.target].error ? "marker-danger" : "marker-custom",
                            type: MarkerType.ArrowClosed,
                        },
                    data: {
                        haveAdd: !isReadOnly && isAllowedEdit && this.haveAdd(edge, nodeByUid, clusterRootTaskNodeUids, readOnlyUidPrefixes),
                        haveDashArray: nodeByUid[edge.source].type.endsWith("GraphTrigger")
                            || nodeByUid[edge.target].type.endsWith("GraphTrigger")
                            || edge.source.startsWith(TRIGGERS_NODE_UID),
                        color: this.getEdgeColor(edge, nodeByUid),
                        unused: edge.unused
                    },
                    style: {
                        zIndex: 10,
                    }
                })
            }
        }
        return elements;
    }

    static isClusterRootOrEnd(node) {
        return ["GraphClusterRoot", "GraphClusterEnd"].some(s => node.type.endsWith(s));
    }

    static computeClusterColor(cluster) {
        if (cluster.uid === CLUSTER_PREFIX + TRIGGERS_NODE_UID) {
            return "success";
        }

        if (cluster.type.endsWith("SubflowGraphCluster")) {
            return "primary";
        }

        if (cluster.error) {
            return "danger";
        }

        return "blue";
    }

    static isExpandableTask(node, clusterByNodeUid, edgeReplacer, enableSubflowInteraction) {
        if (Object.values(edgeReplacer).includes(node.uid)) {
            return true;
        }

        if (this.isCollapsedCluster(node)) {
            return true;
        }

        return node.type.endsWith("SubflowGraphTask") && clusterByNodeUid[node.uid]?.uid?.replace(CLUSTER_PREFIX, "") !== node.uid && enableSubflowInteraction;
    }
}
