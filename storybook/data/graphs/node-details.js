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
            "uid": "root.ClickHouse",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "ClickHouse",
                "type": "io.kestra.plugin.jdbc.clickhouse.BulkInsert",
                "message": "Hello World! \uD83D\uDE80",
                "provider": "John",
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.Avro",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "Avro",
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
            "uid": "root.DataFactory",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "DataFactory",
                "type": "io.kestra.plugin.azure.datafactory.CreateRun",
                "message": "All Done \uD83C\uDF89"
            },
            "relationType": "SEQUENTIAL"
        }
    ],
    "edges": [
        {
            "source": "root.root-4YSfVCqMyeEV2iJgSzZQgA",
            "target": "root.ClickHouse",
            "relation": {}
        },
        {
            "source": "root.ClickHouse",
            "target": "root.Avro",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.Avro",
            "target": "root.DataFactory",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.DataFactory",
            "target": "root.end-6GSmakgmr7wljoyPr6kaNw",
            "relation": {}
        },
    ],
    "clusters": []
}