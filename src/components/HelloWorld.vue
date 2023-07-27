<template>
    <h1> Kestra Topology Library </h1>
    <div class="vueflow">
        <VueFlow v-model="elements" fit-view-on-init>
            <template #node-task="props">
                <task-node
                    v-bind="props"
                    @edit="console.log('edit')"
                    @expand="handleCollapse($event)"
                />
            </template>
            <template #node-cluster="props">
                <cluster-node
                    v-bind="props"
                    @collapse="handleCollapse($event)"
                />
            </template>
            <template #edge-edge="props">
                <edge-node
                    v-bind="props"/>
            </template>
            <template #node-dot="props">
                <dot v-bind="props"/>
            </template>
            <Background/>
        </VueFlow>
    </div>
</template>

<script setup>
    import {ref} from "vue";
    import {Position, VueFlow} from "@vue-flow/core";
    import {Background} from "@vue-flow/background";
    import GraphUtils from "../functions/GraphUtils.js";
    import Dot from "./nodes/DotNode.vue";
    import TaskNode from "./nodes/TaskNode.vue";
    import EdgeNode from "./nodes/EdgeNode.vue";
    import ClusterNode from "./nodes/ClusterNode.vue";

    const collapsed = ref([])
    const elements = ref([])
    const handleCollapse = (value) => {
        if (!collapsed.value.includes(value)) {
            collapsed.value.push(value)
        } else {
            collapsed.value.splice(collapsed.value.indexOf(value), 1)
        }
        GraphUtils.cleanGraph();
        elements.value = [];
        generateGraph();
    };


    const generateGraph = () => {
        elements.value = [
            {
                id: 'start',
                label: 'start',
                type: 'dot',
                position: {x: 0, y: 75},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            },
            {
                id: 'end',
                label: 'end',
                type: 'dot',
                position: {x: 1250, y: 75},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            },
            {
                id: 'parent-1',
                label: 'parent node',
                type: collapsed.value.includes('parent-1') ? "task" : "cluster",
                position: {x: 350, y: 0},
                style: collapsed.value.includes('parent-1') ? {} : {width: '400px', height: '300px'},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                class: collapsed.value.includes('parent-1') ? '' : 'bg-light-darkblue-border rounded p-2',
                data: {
                    color: "darkblue",
                    expandable: true
                }
            },
            {
                id: 'task-2',
                type: 'task',
                label: 'Node 2',
                position: {x: 900, y: 75},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            },
            {
                id: 'task-3',
                type: 'task',
                label: 'Node 1',
                position: {x: 100, y: 75},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                data: {
                    color: "danger"
                }
            },
            {id: 'p1-t2', source: 'parent-1', target: 'task-2', type: 'edge', data: {class: "ERROR"}},
            {id: 't3-p1', source: 'task-3', target: 'parent-1', type: 'edge', data: {class: "ERROR"}},
            {id: 'start-t3', source: 'start', target: 'task-3', type: 'edge'},
            {id: 't2-end', source: 'task-2', target: 'end', type: 'edge'},
        ]
        if (!collapsed.value.includes('parent-1')) {
            elements.value.push(
                {
                    id: 'task-1',
                    type: 'task',
                    label: 'Node 1',
                    position: {x: 25, y: 50},
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    parentNode: 'parent-1',
                    data: {
                        color: "success"
                    }
                })
            elements.value.push(
                {
                    id: 'task-1.5',
                    type: 'task',
                    label: 'Node 1',
                    position: {x: 250, y: 50},
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    parentNode: 'parent-1',
                    data: {
                        color: "warning"
                    }
                })
            elements.value.push({
                id: 'e1-1.5',
                source: 'task-1',
                target: 'task-1.5',
                type: 'edge',
                data: {class: "ERROR"},
            })
        }
    }

    generateGraph();
</script>
<script>
    import {Position, VueFlow} from "@vue-flow/core";

    export default {
        name: "HelloWorld",
    }

</script>


<style lang="scss">
    @import '@vue-flow/core/dist/style.css';

    .vueflow {
        height: 750px;
        width: 600px;
    }

    .vue-flow__edge-path, .vue-flow__connection-path {
        stroke-width: 3px;

        &.ERROR {
            stroke: var(--bs-danger);
        }

        &.DYNAMIC {
            stroke: var(--bs-teal);
        }

        &.CHOICE {
            stroke: var(--bs-orange);
        }
    }
</style>
