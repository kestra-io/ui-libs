import {test, expect, describe} from "vitest";
import * as VueFlowUtils from "./VueFlowUtils";

const graph = {
            nodes: [
                {uid: "1", type: "task"},
                {uid: "2", type: "task", task: {
                    id: "task1",
                    type: "io.kestra.one"
                }},
                {uid: "3", type: "task", task: {
                    id: "task2",
                    type: "io.kestra.two"
                }},
                {uid: "4", type: "task", task: {
                    id: "task3",
                    type: "io.kestra.three"
                }},
                {uid: "5", type: "task", task: {
                    id: "task4",
                    type: "io.kestra.four"
                }},
                {uid: "6", type: "task", task: {
                    id: "task5",
                    type: "io.kestra.five"
                }}
            ],
            edges: [
                {source: "1", target: "2", id: "e1", type: "default"},
                {source: "1", target: "3", id: "e2", type: "default"},
                {source: "2", target: "4", id: "e3", type: "default"},
                {source: "3", target: "5", id: "e4", type: "default"},
                {source: "4", target: "6", id: "e5", type: "default"},
                {source: "5", target: "6", id: "e6", type: "default"}
            ],
            clusters: []
        } as any;

describe("VueFlowUtils", () => {
    test("getRootNodes should return nodes with no incoming edges", () => {
        const rootNodes = VueFlowUtils.getRootNodes(graph);
        expect(rootNodes).toEqual([{uid: "1", type: "task"}]);
    });

    test("getTargetNodesEdges should return edges connected to a node", () => {
        const edges = VueFlowUtils.getTargetNodesEdges(graph, "1");
        expect(edges).toEqual([
            {source: "1", target: "2", id: "e1", type: "default"},
            {source: "1", target: "3", id: "e2", type: "default"}
        ]);
    });
    test("getNextTaskNodes should return next task nodes", () => {
        const nextTaskNodes = VueFlowUtils.getNextTaskNodes(graph, {uid: "1"} as any);
        expect(nextTaskNodes).toEqual([
            {uid: "2", type: "task", task: {id: "task1", type: "io.kestra.one"}},
            {uid: "3", type: "task", task: {id: "task2", type: "io.kestra.two"}},
        ]);
    });

    test("areTasksIdenticalInGraphUntilTask should return true for identical tasks", () => {
        const previousGraph = {
            ...graph
        };
        const currentGraph = {
            ...graph
        };
        expect(previousGraph).toEqual(currentGraph);
        expect(VueFlowUtils.areTasksIdenticalInGraphUntilTask(previousGraph, currentGraph, "task4")).toBeTruthy();
    });

    test("areTasksIdenticalInGraphUntilTask should return false for different tasks", () => {
        const previousGraph = {
            ...graph
        };
        const currentGraph = {
            ...graph,
            nodes: graph.nodes.map((node: any) => {
                if (node.uid === "3") {
                    return {...node, task: {...node.task, id: "task1-modified"}};
                }
                return node;
            })
        };
        expect(VueFlowUtils.areTasksIdenticalInGraphUntilTask(previousGraph, currentGraph, "task4")).toBeFalsy();
    });
});