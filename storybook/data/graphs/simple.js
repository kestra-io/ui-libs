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
            "uid": "root.message",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "message",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "Hello World! \uD83D\uDE80"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.message_again",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "message_again",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "Hello World! \uD83D\uDE80 2"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.all_done",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "all_done",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "All Done \uD83C\uDF89"
            },
            "relationType": "SEQUENTIAL"
        }
    ],
    "edges": [
        {
            "source": "root.root-4YSfVCqMyeEV2iJgSzZQgA",
            "target": "root.message",
            "relation": {}
        },
        {
            "source": "root.all_done",
            "target": "root.end-6GSmakgmr7wljoyPr6kaNw",
            "relation": {}
        },
        {
            "source": "root.message_again",
            "target": "root.all_done",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.message",
            "target": "root.message_again",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        }
    ],
    "clusters": []
}