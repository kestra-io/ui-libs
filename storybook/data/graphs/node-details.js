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
                "type": "io.kestra.plugin.jdbc.clickhouse.BulkInsert",
                "message": "Hello World! \uD83D\uDE80",
                "provider": "John",
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.FAILED",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "FAILED",
                "type": "io.kestra.plugin.serdes.avro.AvroToIon",
                "message": "Hello World! \uD83D\uDE80 2",
                "additionalInfo": {
                    "key1": "value1",
                    "key2": "value2",
                    "key3": "value3",
                }
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.RUNNING",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "RUNNING",
                "type": "io.kestra.plugin.azure.datafactory.CreateRun",
                "message": "All Done \uD83C\uDF89"
            },
            "relationType": "SEQUENTIAL"
        }
    ],
    "edges": [
        {
            "source": "root.root-4YSfVCqMyeEV2iJgSzZQgA",
            "target": "root.SUCCESS",
            "relation": {}
        },
        {
            "source": "root.SUCCESS",
            "target": "root.FAILED",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.FAILED",
            "target": "root.RUNNING",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.RUNNING",
            "target": "root.end-6GSmakgmr7wljoyPr6kaNw",
            "relation": {}
        },
    ],
    "clusters": []
}