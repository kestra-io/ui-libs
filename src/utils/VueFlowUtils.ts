import {GraphNode, GraphEdge, MarkerType, Position, useVueFlow, Elements} from "@vue-flow/core";
import dagre from "dagre";
import {YamlUtils} from "./YamlUtils";
import Utils from "./Utils";
import {CLUSTER_PREFIX, NODE_SIZES} from "./constants";

const TRIGGERS_NODE_UID = "root.Triggers";

enum BranchType {
    ERROR = "ERROR",
    FINALLY = "FINALLY"
}

interface MinimalNode {
    unused?: boolean;
    executionId?: string;
    branchType?: BranchType;
    uid: string;
    type: string;
    task?: {
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

export default {
  predecessorsEdge(vueFlowId:string, nodeUid: string): GraphEdge[] {
    const {getEdges} = useVueFlow(vueFlowId);

    const nodes = [];

    for (const edge of getEdges.value) {
      if (edge.target === nodeUid) {
        nodes.push(edge);
        const recursiveEdge = this.predecessorsEdge(vueFlowId, edge.source);
        if (recursiveEdge.length > 0) {
          nodes.push(...recursiveEdge);
        }
      }
    }

    return nodes;
  },

  successorsEdge(vueFlowId:string, nodeUid:string):GraphEdge[] {
    const {getEdges} = useVueFlow(vueFlowId);

    const nodes = [];

    for (const edge of getEdges.value) {
      if (edge.source === nodeUid) {
        nodes.push(edge);
        const recursiveEdge = this.successorsEdge(vueFlowId, edge.target);
        if (recursiveEdge.length > 0) {
          nodes.push(...recursiveEdge);
        }
      }
    }

    return nodes;
  },

  predecessorsNode(vueFlowId:string, nodeUid:string): (GraphEdge | GraphNode)[] {
    const {getEdges, findNode} = useVueFlow(vueFlowId);

    const foundNode = findNode(nodeUid)
    const nodes: (GraphEdge | GraphNode)[] = foundNode ? [foundNode] : [];

    for (const edge of getEdges.value) {
      if (edge.target === nodeUid) {
        nodes.push(edge.sourceNode);
        const recursiveEdge = this.predecessorsNode(vueFlowId, edge.source);
        if (recursiveEdge.length > 0) {
          nodes.push(...recursiveEdge);
        }
      }
    }

    return nodes;
  },

  successorsNode(vueFlowId:string, nodeUid:string) {
    const {getEdges, findNode} = useVueFlow(vueFlowId);

    const nodes = [findNode(nodeUid)];

    for (const edge of getEdges.value) {
      if (edge.source === nodeUid) {
        nodes.push(edge.targetNode);
        const recursiveEdge = this.successorsNode(vueFlowId, edge.target);
        if (recursiveEdge.length > 0) {
          nodes.push(...recursiveEdge);
        }
      }
    }

    return nodes;
  },

  linkedElements(vueFlowId:string, nodeUid:string) {
    return [
      ...this.predecessorsEdge(vueFlowId, nodeUid),
      ...this.predecessorsNode(vueFlowId, nodeUid),
      ...this.successorsEdge(vueFlowId, nodeUid),
      ...this.successorsNode(vueFlowId, nodeUid),
    ];
  },

  generateDagreGraph(
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
          width: this.getNodeWidth(node),
          height: this.getNodeHeight(node),
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
          width: this.getNodeWidth(node),
          height: this.getNodeHeight(node),
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
      const newEdge = this.replaceIfCollapsed(
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
  },

  getNodePosition(n: {
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
      const parentPosition = this.getNodePosition(parent);
      position.x = position.x - parentPosition.x;
      position.y = position.y - parentPosition.y;
    }
    return position;
  },

  getNodeWidth(node: MinimalNode) {
    return this.isTaskNode(node) || this.isTriggerNode(node)
      ? NODE_SIZES.TASK_WIDTH
      : (this.isCollapsedCluster(node)
      ? NODE_SIZES.COLLAPSED_CLUSTER_WIDTH
      : NODE_SIZES.DOT_WIDTH);
  },

  getNodeHeight(node: MinimalNode) {
    return this.isTaskNode(node) || this.isTriggerNode(node)
      ? NODE_SIZES.TASK_HEIGHT
      : (this.isCollapsedCluster(node)
      ? NODE_SIZES.COLLAPSED_CLUSTER_HEIGHT
      : NODE_SIZES.DOT_HEIGHT);
  },

  isTaskNode(node: MinimalNode) {
    return ["GraphTask", "SubflowGraphTask"].some((t) => node.type.endsWith(t));
  },

  isTriggerNode(node: MinimalNode) {
    return node.type.endsWith("GraphTrigger");
  },

  isCollapsedCluster(node: MinimalNode) {
    return node.type === "collapsedcluster";
  },

  replaceIfCollapsed(source:string, target: string, edgeReplacer: EdgeReplacer, hiddenNodes: string[]) {
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
  },

  cleanGraph(vueflowId:string) {
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
  },

  flowHaveTasks(source:string) {
    return source ? YamlUtils.flowHaveTasks(source) : false;
  },

  nodeColor(node:MinimalNode, collapsed: Set<string>) {
    if (node.uid === TRIGGERS_NODE_UID) {
      return "success";
    }

    if (this.isTriggerNode(node) || this.isCollapsedCluster(node)) {
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
  },

  haveAdd(edge:GraphEdge,
    nodeByUid:Record<string, MinimalNode>,
    clustersRootTaskUids:string[],
    readOnlyUidPrefixes:string[]) {
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
  },

  getEdgeColor(edge:GraphEdge, nodeByUid:Record<string, MinimalNode>,) {
    const sourceNode = nodeByUid[edge.source];
    const targetNode = nodeByUid[edge.target];

    if (targetNode.branchType === BranchType.ERROR || sourceNode.branchType === BranchType.ERROR) {
      return "error";
    }

    if (targetNode.branchType === BranchType.FINALLY || sourceNode.branchType === BranchType.FINALLY) {
      return "warning";
    }

    return null;
  },

  generateGraph(
    _vueFlowId: string,
    flowId:string | undefined,
    namespace:string| undefined,
    flowGraph: FlowGraph | undefined,
    flowSource:string | undefined,
    hiddenNodes: string[],
    isHorizontal: boolean,
    edgeReplacer: EdgeReplacer,
    collapsed: Set<string>,
    clusterToNode: MinimalNode[],
    isReadOnly: boolean,
    isAllowedEdit: boolean,
    enableSubflowInteraction: boolean
  ):Elements | undefined{
    const elements:Elements = [];

    const clustersWithoutRootNode = [CLUSTER_PREFIX + TRIGGERS_NODE_UID];

    if (!flowGraph || (flowSource && !this.flowHaveTasks(flowSource))) {
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

    const dagreGraph = this.generateDagreGraph(
      flowGraph,
      hiddenNodes,
      isHorizontal,
      clustersWithoutRootNode,
      edgeReplacer,
      collapsed,
      clusterToNode
    );

    const clusterByNodeUid:Record<string, Cluster>  = {};
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

        const clusterColor = this.computeClusterColor(cluster.cluster);

        elements.push({
          id: clusterUid,
          type: "cluster",
          parentNode: parentNode,
          position: this.getNodePosition(
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
          class: `bg-light-${clusterColor}-border rounded p-2`,
        } as any);
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
        const isReadOnlyTask =
          isReadOnly ||
          node.task?.type?.includes("$") ||
          readOnlyUidPrefixes.some((prefix) =>
            node.uid.startsWith(prefix + ".")
          );
        elements.push({
          id: node.uid,
          type: nodeType,
          position: this.getNodePosition(
            dagreNode,
            clusterByNodeUid[node.uid]
              ? dagreGraph.node(clusterByNodeUid[node.uid].uid)
              : undefined
          ),
          style: {
            width: this.getNodeWidth(node) + "px",
            height: this.getNodeHeight(node) + "px",
          },
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          parentNode: clusterByNodeUid[node.uid]
            ? clusterByNodeUid[node.uid].uid
            : undefined,
          draggable: nodeType === "task" ? !isReadOnlyTask : false,
          data: {
            node: node,
            namespace:
              clusterByNodeUid[node.uid]?.taskNode?.task?.namespace ??
              namespace,
            flowId:
              clusterByNodeUid[node.uid]?.taskNode?.task?.flowId ?? flowId,
            isFlowable:
              clusterByNodeUid[node.uid]?.uid === CLUSTER_PREFIX + node.uid &&
              !node.type.endsWith("SubflowGraphTask"),
            color: color,
            expandable: this.isExpandableTask(
              node,
              clusterByNodeUid,
              edgeReplacer,
              enableSubflowInteraction
            ),
            isReadOnly: isReadOnlyTask,
            iconComponent: this.isCollapsedCluster(node)
              ? "lightning-bolt"
              : null,
            executionId: node.executionId,
            unused: node.unused,
          },
          class:
            node.type === "collapsedcluster"
              ? `bg-light-${color}-border rounded`
              : "",
        });
      }
    }

    const clusterRootTaskNodeUids = rawClusters
      .filter((c) => c.taskNode)
      .map((c) => c.taskNode.uid);
    const edges = flowGraph.edges ?? [];

    for (const edge of edges) {
      const newEdge = this.replaceIfCollapsed(
        edge.source,
        edge.target,
        edgeReplacer,
        hiddenNodes
      );
      if (newEdge) {
        const edgeColor = this.getEdgeColor(edge, nodeByUid);
        elements.push({
          id: newEdge.source + "|" + newEdge.target,
          source: newEdge.source,
          target: newEdge.target,
          type: "edge",
          markerEnd: this.isClusterRootOrEnd(nodeByUid[newEdge.target])
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
              this.haveAdd(
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
  },

  isClusterRootOrEnd(node:MinimalNode) {
    return ["GraphClusterRoot", "GraphClusterFinally", "GraphClusterEnd"].some((s) =>
      node.type.endsWith(s)
    );
  },

  computeClusterColor(cluster:Cluster) {
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
  },

  isExpandableTask(
    node:MinimalNode,
    clusterByNodeUid: Record<string, Cluster>,
    edgeReplacer: EdgeReplacer,
    enableSubflowInteraction?: boolean
  ) {
    if (Object.values(edgeReplacer).includes(node.uid)) {
      return true;
    }

    if (this.isCollapsedCluster(node)) {
      return true;
    }

    return (
      node.type.endsWith("SubflowGraphTask") &&
      clusterByNodeUid[node.uid]?.uid?.replace(CLUSTER_PREFIX, "") !==
        node.uid &&
      enableSubflowInteraction
    );
  },
};
