<template v-if="pluginData">
    <h1 id="apache-druid">
        {{pluginData.title}}
    </h1>
    <p>{{pluginData.description}}</p>
    <template v-for="(item, index) in pageTriggers">
        <h2 :id="item.name" v-if="pageTriggers.length > 1">
            <a :href="`#${item.name}`">
                <span class="text-center d-block">
                    <NuxtImg
                      v-if="pageIcon"
                      :src="pageIcon"
                      :alt="pageTitle"
                      width="40px"
                      height="40px"
                      loading="lazy"
                      format="webp"
                      quality="80"
                      densities="x1 x2"
                      class="me-3 page-icon"
                    />
                </span>
                {{item.name}}
            </a>
        </h2>
        <h3 :id="index === 0 ? 'triggers' : `triggers-${index}`">
            <a :href="index === 0 ? '#triggers' : `#triggers-${index}`">Triggers</a></h3>
        <ul>
            <li v-for="children in item.children">
                <a :href="`/plugins/${pluginData.name}/${children.url}`" class="">
                    {{children.name}}
                </a>
            </li>
        </ul>
    </template>
    <template v-for="(item, index) in pageTasks">
        <h2 :id="item.name" v-if="pageTasks.length > 1">
            <a :href="`#${item.name}`">
                <span class="text-center d-block">
                    <NuxtImg
                      v-if="pageIcon"
                      :src="pageIcon"
                      :alt="pageTitle"
                      width="40px"
                      height="40px"
                      loading="lazy"
                      format="webp"
                      quality="80"
                      densities="x1 x2"
                      class="me-3 page-icon"
                    />
                </span>
                {{item.name}}
            </a>
        </h2>
        <h3 v-if="item.subName">{{item.subName}}</h3>
        <h4 :id="index === 0 ? 'tasks' : `tasks-${index}`">
            <a :href="index === 0 ? '#tasks' : `#tasks-${index}`">Tasks</a>
        </h4>
        <ul>
            <li v-for="children in item.children">
                <a :href="`/plugins/${pluginData.name}/${children.url}`" class="">
                    {{children.name}}
                </a>
            </li>
        </ul>
    </template>
</template>

<script>
    import {defineComponent} from "vue";

    export default defineComponent({
        props: {
            pluginData: {
                type: Object,
                default: null
            },
            pageIcon: {
                type: String,
                required: true
            },
            pageTitle: {
                type: String,
                required: true
            },
        },
        data() {
            return {
                pageTasks: [],
                pageTriggers: [],
            }
        },
        async created() {
            this.generatePluginDataBlocks(this.pluginData.tasks, this.pageTasks);
            this.generatePluginDataBlocks(this.pluginData.triggers, this.pageTriggers)
        },
        methods: {
            generatePluginDataBlocks(blocks, pageBlock) {
                blocks?.forEach(item => {
                    const itemSplit = item.split('.');
                    const itemsNameArr = itemSplit.slice(4, itemSplit.length-1);
                    const exitsPage = pageBlock.find(tab => tab.name === itemsNameArr[0]);
                    let spitedChildName = item.split('.');
                    if (pageBlock.length === 0 || !exitsPage) {
                        pageBlock.push({
                            name: itemsNameArr[0] || '',
                            subName: itemsNameArr[1] || '',
                            children : [{
                                name: spitedChildName[spitedChildName.length - 1],
                                url: item,
                            }]
                        })
                    } else {
                        exitsPage.children.push({
                            name: spitedChildName[spitedChildName.length - 1],
                            url: item,
                        });
                    }
                })
            }
        }
    });
</script>
