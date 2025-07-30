export default {
    "nodes": [
        {
            "uid": "root.root-4YSfVCqMyeEV2iJgSzZQgA",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-6GSmakgmr7wljoyPr6kaNw",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.SUCCESS",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "SUCCESS",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "Hello World! \uD83D\uDE80"
            },
            "relationType": "SEQUENTIAL"
        },
        // {
        //     "uid": "root.FAILED",
        //     "type": "io.kestra.core.models.hierarchies.GraphTask",
        //     "task": {
        //         "id": "FAILED",
        //         "type": "io.kestra.plugin.core.log.Log",
        //         "message": "Hello World! \uD83D\uDE80 2"
        //     },
        //     "relationType": "SEQUENTIAL"
        // },
        // {
        //     "uid": "root.RUNNING",
        //     "type": "io.kestra.core.models.hierarchies.GraphTask",
        //     "task": {
        //         "id": "RUNNING",
        //         "type": "io.kestra.plugin.core.log.Log",
        //         "message": "All Done \uD83C\uDF89"
        //     },
        //     "relationType": "SEQUENTIAL"
        // },
        // {
        //     "uid": "root.SKIPPED",
        //     "type": "io.kestra.core.models.hierarchies.GraphTask",
        //     "task": {
        //         "id": "SKIPPED",
        //         "type": "io.kestra.plugin.core.log.Log",
        //         "message": "All Done \uD83C\uDF89"
        //     },
        //     "relationType": "SEQUENTIAL"
        // },
        // {
        //     "uid": "root.WARNING",
        //     "type": "io.kestra.core.models.hierarchies.GraphTask",
        //     "task": {
        //         "id": "WARNING",
        //         "type": "io.kestra.plugin.core.log.Log",
        //         "message": "All Done \uD83C\uDF89"
        //     },
        //     "relationType": "SEQUENTIAL"
        // }
    ],
    "edges": [
        {
            "source": "root.root-4YSfVCqMyeEV2iJgSzZQgA",
            "target": "root.SUCCESS",
            "relation": {}
        },
        // {
        //     "source": "root.FAILED",
        //     "target": "root.RUNNING",
        //     "relation": {
        //         "relationType": "SEQUENTIAL"
        //     }
        // },
        // {
        //     "source": "root.SUCCESS",
        //     "target": "root.FAILED",
        //     "relation": {
        //         "relationType": "SEQUENTIAL"
        //     }
        // },
        // {
        //     "source": "root.RUNNING",
        //     "target": "root.SKIPPED",
        //     "relation": {
        //         "relationType": "SEQUENTIAL"
        //     }
        // },
        // {
        //     "source": "root.SKIPPED",
        //     "target": "root.WARNING",
        //     "relation": {
        //         "relationType": "SEQUENTIAL"
        //     }
        // },
        // {
        //     "source": "root.WARNING",
        //     "target": "root.end-6GSmakgmr7wljoyPr6kaNw",
        //     "relation": {}
        // },
    ],
    "clusters": []
}