import {GraphNode, GraphEdge, MarkerType, Position, useVueFlow, Elements} from "@vue-flow/core";
import dagre from "dagre";
import Utils from "./Utils";
import {CLUSTER_PREFIX, NODE_SIZES} from "./constants";
import {flowHaveTasks as yamlFlowHaveTask} from "./FlowYamlUtils";
import isEqual from "lodash/isEqual"

const TRIGGERS_NODE_UID = "root.Triggers";

enum BranchType {
    ERROR = "ERROR",
    FINALLY = "FINALLY",
    AFTER_EXECUTION = "AFTER_EXECUTION"
}

interface MinimalNode {
    unused?: boolean;
    executionId?: string;
    branchType?: BranchType;
    uid: string;
    type: string;
    task?: {
        id?: string;
        type: string;
        namespace: string;
        flowId: string;
    }
}

interface Cluster {
    uid: string
    type: string
    nodes: MinimalNode[]
    taskNode: {
        uid: string
        task: {
            type: string
            namespace: string
            flowId: string
        }
    }
    branchType: BranchType
}

export interface FlowGraph {
    nodes: MinimalNode[];
    clusters: {
        cluster: Cluster;
        nodes: string[];
        parents: {
            uid: string;
        }[];
    }[];
    edges: GraphEdge[]
}

type EdgeReplacer = Record<string, string>


export function predecessorsEdge(vueFlowId: string, nodeUid: string): GraphEdge[] {
    const {getEdges} = useVueFlow(vueFlowId);

    const nodes = [];

    for (const edge of getEdges.value) {
        if (edge.target === nodeUid) {
            nodes.push(edge);
            const recursiveEdge = predecessorsEdge(vueFlowId, edge.source);
            if (recursiveEdge.length > 0) {
                nodes.push(...recursiveEdge);
            }
        }
    }

    return nodes;
}

export function successorsEdge(vueFlowId: string, nodeUid: string): GraphEdge[] {
    const {getEdges} = useVueFlow(vueFlowId);

    const nodes = [];

    for (const edge of getEdges.value) {
        if (edge.source === nodeUid) {
            nodes.push(edge);
            const recursiveEdge = successorsEdge(vueFlowId, edge.target);
            if (recursiveEdge.length > 0) {
                nodes.push(...recursiveEdge);
            }
        }
    }

    return nodes;
}

export function predecessorsNode(vueFlowId: string, nodeUid: string): (GraphEdge | GraphNode)[] {
    const {getEdges, findNode} = useVueFlow(vueFlowId);

    const foundNode = findNode(nodeUid)
    const nodes: (GraphEdge | GraphNode)[] = foundNode ? [foundNode] : [];

    for (const edge of getEdges.value) {
        if (edge.target === nodeUid) {
            nodes.push(edge.sourceNode);
            const recursiveEdge = predecessorsNode(vueFlowId, edge.source);
            if (recursiveEdge.length > 0) {
                nodes.push(...recursiveEdge);
            }
        }
    }

    return nodes;
}

export function successorsNode(vueFlowId: string, nodeUid: string) {
    const {getEdges, findNode} = useVueFlow(vueFlowId);

    const nodes = [findNode(nodeUid)];

    for (const edge of getEdges.value) {
        if (edge.source === nodeUid) {
            nodes.push(edge.targetNode);
            const recursiveEdge = successorsNode(vueFlowId, edge.target);
            if (recursiveEdge.length > 0) {
                nodes.push(...recursiveEdge);
            }
        }
    }

    return nodes;
}

export function linkedElements(vueFlowId: string, nodeUid: string) {
    return [
        ...predecessorsEdge(vueFlowId, nodeUid),
        ...predecessorsNode(vueFlowId, nodeUid),
        ...successorsEdge(vueFlowId, nodeUid),
        ...successorsNode(vueFlowId, nodeUid),
    ];
}

export function generateDagreGraph(
    flowGraph: { nodes: any; clusters: any; edges: any },
    hiddenNodes: string[],
    isHorizontal: boolean,
    clustersWithoutRootNode: string[],
    edgeReplacer: EdgeReplacer,
    collapsed: Set<string>,
    clusterToNode: MinimalNode[]
) {
    const dagreGraph = new dagre.graphlib.Graph({compound: true});
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({rankdir: isHorizontal ? "LR" : "TB"});

    for (const node of flowGraph.nodes) {
        if (!hiddenNodes.includes(node.uid)) {
            dagreGraph.setNode(node.uid, {
                width: getNodeWidth(node),
                height: getNodeHeight(node),
            });
        }
    }

    for (const cluster of flowGraph.clusters || []) {
        const nodeUid = cluster.cluster.uid.replace(CLUSTER_PREFIX, "");
        if (
            clustersWithoutRootNode.includes(cluster.cluster.uid) &&
            collapsed.has(nodeUid)
        ) {
            const node = {uid: nodeUid, type: "collapsedcluster"};
            dagreGraph.setNode(nodeUid, {
                width: getNodeWidth(node),
                height: getNodeHeight(node),
            });
            clusterToNode.push(node);
            continue;
        }
        if (!edgeReplacer[cluster.cluster.uid]) {
            dagreGraph.setNode(cluster.cluster.uid, {clusterLabelPos: "top"});

            for (const node of cluster.nodes || []) {
                if (!hiddenNodes.includes(node)) {
                    dagreGraph.setParent(node, cluster.cluster.uid);
                }
            }
        }
        if (cluster.parents) {
            const nodeChild = edgeReplacer[cluster.cluster.uid]
                ? edgeReplacer[cluster.cluster.uid]
                : cluster.cluster.uid;
            if (!hiddenNodes.includes(nodeChild)) {
                dagreGraph.setParent(
                    nodeChild,
                    cluster.parents[cluster.parents.length - 1]
                );
            }
        }
    }

    for (const edge of flowGraph.edges || []) {
        const newEdge = replaceIfCollapsed(
            edge.source,
            edge.target,
            edgeReplacer,
            hiddenNodes
        );
        if (newEdge) {
            dagreGraph.setEdge(newEdge.source, newEdge.target);
        }
    }

    dagre.layout(dagreGraph);
    return dagreGraph;
}

export function getNodePosition(n: {
    x: number;
    y: number;
    width: number;
    height: number;
}, parent?: {
    x: number;
    y: number;
    width: number;
    height: number;
}) {
    const position = {x: n.x - n.width / 2, y: n.y - n.height / 2};

    // bug with parent node,
    if (parent) {
        const parentPosition = getNodePosition(parent);
        position.x = position.x - parentPosition.x;
        position.y = position.y - parentPosition.y;
    }
    return position;
}

export function getNodeWidth(node: MinimalNode) {
    return isTaskNode(node) || isTriggerNode(node)
        ? NODE_SIZES.TASK_WIDTH
        : (isCollapsedCluster(node)
            ? NODE_SIZES.COLLAPSED_CLUSTER_WIDTH
            : NODE_SIZES.DOT_WIDTH);
}

export function getNodeHeight(node: MinimalNode) {
    return isTaskNode(node) || isTriggerNode(node)
        ? NODE_SIZES.TASK_HEIGHT
        : (isCollapsedCluster(node)
            ? NODE_SIZES.COLLAPSED_CLUSTER_HEIGHT
            : NODE_SIZES.DOT_HEIGHT);
}

export function isTaskNode(node: MinimalNode) {
    return ["GraphTask", "SubflowGraphTask$1"].some((t) => node.type.endsWith(t));
}

export function isTriggerNode(node: MinimalNode) {
    return node.type.endsWith("GraphTrigger");
}

export function isCollapsedCluster(node: MinimalNode) {
    return node.type === "collapsedcluster";
}

export function replaceIfCollapsed(source: string, target: string, edgeReplacer: EdgeReplacer, hiddenNodes: string[]) {
    const newSource = edgeReplacer[source] ? edgeReplacer[source] : source;
    const newTarget = edgeReplacer[target] ? edgeReplacer[target] : target;

    if (
        newSource === newTarget ||
        hiddenNodes.includes(newSource) ||
        hiddenNodes.includes(newTarget)
    ) {
        return null;
    }
    return {target: newTarget, source: newSource};
}

export function cleanGraph(vueflowId: string) {
    const {
        getEdges,
        getNodes,
        getElements,
        removeEdges,
        removeNodes,
        removeSelectedElements,
    } = useVueFlow(vueflowId);
    removeEdges(getEdges.value);
    removeNodes(getNodes.value);
    removeSelectedElements(getElements.value);
}

export function flowHaveTasks(source: string) {
    return source ? yamlFlowHaveTask(source) : false;
}

export function nodeColor(node: MinimalNode, collapsed: Set<string>) {
    if (node.uid === TRIGGERS_NODE_UID) {
        return "success";
    }

    if (isTriggerNode(node) || isCollapsedCluster(node)) {
        return "success";
    }

    if (node.type.endsWith("SubflowGraphTask")) {
        return "primary";
    }

    if (node.branchType == BranchType.ERROR) {
        return "danger";
    }

    if (node.branchType == BranchType.FINALLY) {
        return "warning";
    }

    if (collapsed.has(node.uid)) {
        return "blue";
    }

    return "default";
}

export function haveAdd(edge: GraphEdge,
    nodeByUid: Record<string, MinimalNode>,
    clustersRootTaskUids: string[],
    readOnlyUidPrefixes: string[]) {
    // prevent subflow edit (edge = subflowNode -> subflowNode)
    if (
        readOnlyUidPrefixes.some(
            (prefix) =>
                edge.source.startsWith(prefix) && edge.target.startsWith(prefix)
        )
    ) {
        return undefined;
    }

    // edge = clusterRoot -> clusterRootTask
    if (clustersRootTaskUids.includes(edge.target)) {
        return undefined;
    }

    // edge = Triggers cluster -> something || edge = something -> Triggers cluster
    if (
        edge.source.startsWith(TRIGGERS_NODE_UID) ||
        edge.target.startsWith(TRIGGERS_NODE_UID)
    ) {
        return undefined;
    }

    const dotSplitTarget = edge.target.split(".");
    dotSplitTarget.pop();
    const targetNodeClusterUid = dotSplitTarget.join(".");
    const clusterRootTaskId = Utils.afterLastDot(targetNodeClusterUid);

    // edge = task of parallel -> end of parallel, we only add + symbol right after the parallel cluster root task node
    const targetNode = nodeByUid[edge.target];
    if (
        targetNode.type.endsWith("GraphClusterEnd") &&
        nodeByUid[targetNodeClusterUid]?.task?.type?.endsWith("Parallel")
    ) {
        return undefined;
    }

    // edge = something -> clusterRoot ==> we insert before the cluster
    // clusterUid = clusterTraversalPrefix.{rootTaskUid}
    // clusterRoot.uid = clusterUid.someUid = clusterTraversalPrefix.{rootTaskUid}.someUid
    if (targetNode.type.endsWith("GraphClusterRoot")) {
        return [clusterRootTaskId, "before"];
    }

    const sourceIsEndOfCluster =
        nodeByUid[edge.source].type.endsWith("GraphClusterEnd");
    // edge = clusterTask -> clusterEnd ==> we insert after the previous task
    if (!sourceIsEndOfCluster && targetNode.type.endsWith("GraphClusterEnd")) {
        return [Utils.afterLastDot(edge.source), "after"];
    }

    // edge = cluster1End -> something ==> we insert after cluster1
    if (sourceIsEndOfCluster) {
        const dotSplitSource = edge.source.split(".");
        return [dotSplitSource[dotSplitSource.length - 2], "after"];
    }

    return [Utils.afterLastDot(edge.target), "before"];
}

export function getEdgeColor(edge: GraphEdge, nodeByUid: Record<string, MinimalNode>, clusterByNodeUid: Record<string, Cluster>) {
    const findRootBranchType = (nodeId: string): BranchType | null => {
        const uidParts = nodeId.split(".");
        for (let i = 1; i <= uidParts.length; i++) {
            const parentUid = uidParts.slice(0, i).join(".");
            const branchType = clusterByNodeUid[parentUid]?.branchType;
            if (branchType) return branchType;
        }
        return nodeByUid[nodeId]?.branchType ?? null;
    };

    const sourceBranchType = findRootBranchType(edge.source);
    const targetBranchType = findRootBranchType(edge.target);

    return [sourceBranchType, targetBranchType].includes(BranchType.ERROR) ? "danger"
        : [sourceBranchType, targetBranchType].includes(BranchType.FINALLY) ? "warning"
            : null;
}

export function generateGraph(
    _vueFlowId: string,
    flowId: string | undefined,
    namespace: string | undefined,
    flowGraph: FlowGraph | undefined,
    flowSource: string | undefined,
    hiddenNodes: string[],
    isHorizontal: boolean,
    edgeReplacer: EdgeReplacer,
    collapsed: Set<string>,
    clusterToNode: MinimalNode[],
    isReadOnly: boolean,
    isAllowedEdit: boolean,
    enableSubflowInteraction: boolean
): Elements | undefined {
    const elements: Elements = [];

    const clustersWithoutRootNode = [CLUSTER_PREFIX + TRIGGERS_NODE_UID];

    if (!flowGraph || (flowSource && !flowHaveTasks(flowSource))) {
        elements.push({
            id: "start",
            type: "dot",
            position: {x: 0, y: 0},
            style: {
                width: "5px",
                height: "5px",
            },
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            parentNode: undefined,
            draggable: false,
        });
        elements.push({
            id: "end",
            type: "dot",
            position: isHorizontal ? {x: 50, y: 0} : {x: 0, y: 50},
            style: {
                width: "5px",
                height: "5px",
            },
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            parentNode: undefined,
            draggable: false,
        });
        elements.push({
            id: "start|end",
            source: "start",
            target: "end",
            type: "edge",
            data: {
                edge: {
                    relation: {
                        relationType: "SEQUENTIAL",
                    },
                },
                isFlowable: false,
                initTask: true,
                color: "primary",
            },
        });

        return;
    }

    const dagreGraph = generateDagreGraph(
        flowGraph,
        hiddenNodes,
        isHorizontal,
        clustersWithoutRootNode,
        edgeReplacer,
        collapsed,
        clusterToNode
    );

    const clusterByNodeUid: Record<string, Cluster> = {};
    const clusters = flowGraph.clusters || [];
    const rawClusters = clusters.map((c) => c.cluster);
    const readOnlyUidPrefixes = rawClusters
        .filter((c) => c.type.endsWith("SubflowGraphCluster"))
        .map((c) => c.taskNode.uid);

    const nodeByUid = Object.fromEntries(
        flowGraph.nodes.concat(clusterToNode).map((node) => [node.uid, node])
    );
    for (const cluster of clusters) {
        if (
            !edgeReplacer[cluster.cluster.uid] &&
            !collapsed.has(cluster.cluster.uid)
        ) {
            if (
                cluster.cluster.taskNode?.task?.type ===
                "io.kestra.core.tasks.flows.Dag"
            ) {
                readOnlyUidPrefixes.push(cluster.cluster.taskNode.uid);
            }

            for (const nodeUid of cluster.nodes) {
                clusterByNodeUid[nodeUid] = cluster.cluster;
            }

            const clusterUid = cluster.cluster.uid;
            const dagreNode = dagreGraph.node(clusterUid);
            const parentNode = cluster.parents
                ? cluster.parents[cluster.parents.length - 1]
                : undefined;

            const clusterColor = computeClusterColor(cluster.cluster);

            elements.push({
                id: clusterUid,
                type: "cluster",
                parentNode: parentNode,
                position: getNodePosition(
                    dagreNode,
                    parentNode ? dagreGraph.node(parentNode) : undefined
                ),
                style: {
                    width:
                        clusterUid === TRIGGERS_NODE_UID && isHorizontal
                            ? NODE_SIZES.TRIGGER_CLUSTER_WIDTH + "px"
                            : dagreNode.width + "px",
                    height:
                        clusterUid === TRIGGERS_NODE_UID && !isHorizontal
                            ? NODE_SIZES.TRIGGER_CLUSTER_HEIGHT + "px"
                            : dagreNode.height + "px",
                },
                data: {
                    collapsable: true,
                    color: clusterColor,
                    taskNode: cluster.cluster.taskNode,
                    unused: cluster.cluster.taskNode
                        ? nodeByUid[cluster.cluster.taskNode.uid].unused
                        : false,
                },
                class: `ks-topology-${clusterColor}-border rounded p-2`,
            } as any);
        }
    }

    for (const node of flowGraph.nodes.concat(clusterToNode)) {
        if (!hiddenNodes.includes(node.uid)) {
            const dagreNode = dagreGraph.node(node.uid);
            let nodeType = "task";
            if (isClusterRootOrEnd(node)) {
                nodeType = "dot";
            } else if (node.type.includes("GraphTrigger")) {
                nodeType = "trigger";
            } else if (node.type === "collapsedcluster") {
                nodeType = "collapsedcluster";
            }

            const color = nodeColor(node, collapsed);
            // If task type includes '$', it's an inner class so it's probably an internal class not supposed to be editable
            // In such case, only the root task will be editable
            const isReadOnlyTask =
                isReadOnly ||
                node.task?.type?.includes("$") ||
                readOnlyUidPrefixes.some((prefix) =>
                    node.uid.startsWith(prefix + ".")
                );
            elements.push({
                id: node.uid,
                type: nodeType,
                position: getNodePosition(
                    dagreNode,
                    clusterByNodeUid[node.uid]
                        ? dagreGraph.node(clusterByNodeUid[node.uid].uid)
                        : undefined
                ),
                style: {
                    width: getNodeWidth(node) + "px",
                    height: getNodeHeight(node) + "px",
                },
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                parentNode: clusterByNodeUid[node.uid]
                    ? clusterByNodeUid[node.uid].uid
                    : undefined,
                draggable: nodeType === "task" ? !isReadOnlyTask : false,
                data: {
                    node: node,
                    parent: clusterByNodeUid[node.uid] ? clusterByNodeUid[node.uid] : undefined,
                    namespace:
                        clusterByNodeUid[node.uid]?.taskNode?.task?.namespace ??
                        namespace,
                    flowId:
                        clusterByNodeUid[node.uid]?.taskNode?.task?.flowId ?? flowId,
                    isFlowable:
                        clusterByNodeUid[node.uid]?.uid === CLUSTER_PREFIX + node.uid &&
                        !node.type.endsWith("SubflowGraphTask"),
                    color: color,
                    expandable: isExpandableTask(
                        node,
                        clusterByNodeUid,
                        edgeReplacer,
                        enableSubflowInteraction
                    ),
                    isReadOnly: isReadOnlyTask,
                    iconComponent: isCollapsedCluster(node)
                        ? "lightning-bolt"
                        : null,
                    executionId: node.executionId,
                    unused: node.unused,
                },
                class:
                    node.type === "collapsedcluster"
                        ? `ks-topology-${color}-border rounded`
                        : "",
            });
        }
    }

    const clusterRootTaskNodeUids = rawClusters
        .filter((c) => c.taskNode)
        .map((c) => c.taskNode.uid);
    const edges = flowGraph.edges ?? [];

    for (const edge of edges) {
        const newEdge = replaceIfCollapsed(
            edge.source,
            edge.target,
            edgeReplacer,
            hiddenNodes
        );
        if (newEdge) {
            const edgeColor = getEdgeColor(edge, nodeByUid, clusterByNodeUid);
            elements.push({
                id: newEdge.source + "|" + newEdge.target,
                source: newEdge.source,
                target: newEdge.target,
                type: "edge",
                markerEnd: isClusterRootOrEnd(nodeByUid[newEdge.target])
                    ? ""
                    : {
                        id: "marker-" + (nodeByUid[newEdge.target].branchType ? nodeByUid[newEdge.target].branchType?.toLocaleLowerCase() : "custom"),
                        type: MarkerType.ArrowClosed,
                        color: edgeColor ? `var(--ks-border-${edgeColor})` : "var(--ks-topology-edge-color)"
                    },
                data: {
                    haveAdd:
                        !isReadOnly &&
                        isAllowedEdit &&
                        haveAdd(
                            edge,
                            nodeByUid,
                            clusterRootTaskNodeUids,
                            readOnlyUidPrefixes
                        ),
                    haveDashArray:
                        nodeByUid[edge.source].type.endsWith("GraphTrigger") ||
                        nodeByUid[edge.target].type.endsWith("GraphTrigger") ||
                        edge.source.startsWith(TRIGGERS_NODE_UID),
                    color: edgeColor,
                    unused: (edge as any).unused,
                },
                style: {
                    zIndex: 10,
                },
            });
        }
    }

    return elements;
}

export function isClusterRootOrEnd(node: MinimalNode) {
    return ["GraphClusterRoot", "GraphClusterFinally", "GraphClusterAfterExecution", "GraphClusterEnd"].some((s) =>
        node.type.endsWith(s)
    );
}

export function computeClusterColor(cluster: Cluster) {
    if (cluster.uid === CLUSTER_PREFIX + TRIGGERS_NODE_UID) {
        return "success";
    }

    if (cluster.type.endsWith("SubflowGraphCluster")) {
        return "primary";
    }

    if (cluster.branchType === BranchType.ERROR) {
        return "danger";
    }

    return "blue";
}

export function isExpandableTask(
    node: MinimalNode,
    clusterByNodeUid: Record<string, Cluster>,
    edgeReplacer: EdgeReplacer,
    enableSubflowInteraction?: boolean
) {
    if (Object.values(edgeReplacer).includes(node.uid)) {
        return true;
    }

    if (isCollapsedCluster(node)) {
        return true;
    }

    return (
        node.type.endsWith("SubflowGraphTask") &&
        clusterByNodeUid[node.uid]?.uid?.replace(CLUSTER_PREFIX, "") !==
        node.uid &&
        enableSubflowInteraction
    );
}

/**
 * Get nodes that have no incoming edges, i.e., root nodes of the graph.
 */
export function getRootNodes(graph: FlowGraph) {
    const nodeUIDs = graph.nodes.map((node) => node.uid);
    const rootUIDs = nodeUIDs.filter((uid) => {
        return !graph.edges.some((edge) => edge.target === uid);
    });
    return graph.nodes.filter((node) => rootUIDs.includes(node.uid));
}

/**
 * Get the edges connected as the source to a specific node. (outward facing arrows)
 * @param graph The flow graph.
 * @param nodeUid The UID of the node.
 * @returns An array of edges connected to the node.
 */
export function getTargetNodesEdges(graph: FlowGraph, nodeUid?: string) {
    if (!nodeUid) {
        return undefined;
    }
    return graph.edges.filter((edge) => edge.source === nodeUid && edge.target);
}

/**
 * Follow the graph from a specific node to find the next task nodes.
 * This function traverses the graph until it finds a node that is not a cluster.
 * @param graph 
 * @param initialNode The initial node to start the search from.
 * @returns An array of the next task nodes found.
 */
export function getNextTaskNodes(graph: FlowGraph, initialNode: MinimalNode) {
    let edges: GraphEdge[], nextTaskNodes: MinimalNode[], nodeUIDs: string[] = [initialNode.uid];
    // loop until we find a node that is not a cluster
    do {
        // find all the edges that are connected to this task
        edges = nodeUIDs.flatMap((uid) => getTargetNodesEdges(graph, uid)).filter(Boolean) as GraphEdge[];
        // if there are no edges, return undefined
        if (edges.length === 0) {
            return [];
        }
        nodeUIDs = edges.map((edge) => edge.target);
        nextTaskNodes = graph.nodes.filter((node) => nodeUIDs.includes(node.uid) && node.task);
    } while (!nextTaskNodes.length);

    return nextTaskNodes
}

/**
 * Check if the tasks in the current graph are identical to the previous graph until the specified task.
 * @param previousGraph The graph from the previous execution.
 * @param currentGraph The graph from the current execution.
 * @param taskId The ID of the task to check.
 * @returns True if all tasks are identical, false otherwise.
 */
export function areTasksIdenticalInGraphUntilTask(previousGraph: FlowGraph, currentGraph: FlowGraph, taskId?: string) {
    if (!taskId) {
        return false;
    }
    
    let previousRootTaskNodes = getRootNodes(previousGraph);
    let currentRootTaskNodes = getRootNodes(currentGraph);
    
    // if the root nodes are not the same, we cannot compare
    if (previousRootTaskNodes.length !== currentRootTaskNodes.length) {
        return false;
    }

    // avoid infinite loop
    let failIndex = 120

    // walk the graph until we find the taskId in the current root task nodes
    // or until we run out of nodes to compare
    do {
        currentRootTaskNodes = currentRootTaskNodes.flatMap((node) => getNextTaskNodes(currentGraph, node));
        
        // stop if we find the taskId in the current root task nodes
        if (currentRootTaskNodes.some((node: any) => node.task.id === taskId)) {
            return true;
        }

        previousRootTaskNodes = previousRootTaskNodes.flatMap((node) => getNextTaskNodes(previousGraph, node));

        if (previousRootTaskNodes.length !== currentRootTaskNodes.length) {
            return false;
        }

        for (const currentTaskNode of currentRootTaskNodes) {
            const prevTaskNode = previousRootTaskNodes.find((taskNode) => taskNode.task?.id === currentTaskNode.task?.id);
            const prevTaskValue = prevTaskNode?.task as Record<string, any> ?? {};
            const currentTaskValue = currentTaskNode.task as Record<string, any> ?? {};

            // if any member of the task is different, tasks are different
            if (!prevTaskNode 
                || Object.keys(prevTaskValue).length !== Object.keys(currentTaskValue).length
            ){
                return false;
            }
            
            if (!isEqual(prevTaskValue, currentTaskValue)) {
                return false;
            }
            
        }
    } while (previousRootTaskNodes.length && currentRootTaskNodes.length && failIndex-- > 0);

    if (failIndex <= 0) {
        console.warn("areTasksIdenticalInGraphUntilTask: Infinite loop detected, stopping comparison.");
        return false;
    }

    return true;
}

/**
 * @deprecated prefer using VueFlowUtils directly for tree shaking
 */
export default {
    isClusterRootOrEnd,
    computeClusterColor,
    isExpandableTask,
    generateGraph,
    generateDagreGraph,
    getNodePosition,
    getNodeWidth,
    getNodeHeight,
    isTaskNode,
    isTriggerNode,
    isCollapsedCluster,
    replaceIfCollapsed,
    cleanGraph,
    flowHaveTasks,
    nodeColor,
    haveAdd,
    getEdgeColor,
    predecessorsEdge,
    successorsEdge,
    predecessorsNode,
    successorsNode,
    linkedElements,
}