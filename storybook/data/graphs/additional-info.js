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
            "uid": "root.RUNNING",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "RUNNING",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "All Done \uD83C\uDF89",
                "additionalInfo": {
                    "Provider": "Open AI - gpt-5-nano",
                    "Memory": "JOHN",
                    "Tool": "DockerMcpClient"
                }
            },
            "relationType": "SEQUENTIAL"
        },
    ],
    "edges": [
        {
            "source": "root.root-4YSfVCqMyeEV2iJgSzZQgA",
            "target": "root.RUNNING",
            "relation": {}
        },
        {
            "source": "root.RUNNING",
            "target": "root.end-6GSmakgmr7wljoyPr6kaNw",
            "relation": {}
        },
    ],
    "clusters": []
}