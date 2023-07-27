<template>
    <div class="icon rounded border d-flex justify-content-center">
        <img :src="icon" class="" alt="task icon"/>
    </div>

</template>
<script>
    export default {
        name: "TaskIcon",
        props: {
            addTask: {
                type: Boolean,
                default: false
            },
        },
        computed: {
            icon() {
                return this.addTask ? `/Plus.svg`
                    : '/Switch.svg'
            }
        }
    }
</script>
<style scoped>
.icon {
    background-color: var(--bs-white);
    padding: 0.3rem;
    box-shadow: 0 12px 12px 0 rgba(130, 103, 158, 0.10);
    width: 40px;
    height: 40px;
}
</style>