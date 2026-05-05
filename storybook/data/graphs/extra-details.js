export default {
    "nodes": [
        {
            "uid": "root.root-extraDetails",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-extraDetails",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.IngestData",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "IngestData",
                "type": "io.kestra.plugin.jdbc.clickhouse.BulkInsert",
                "sql": "INSERT INTO events SELECT * FROM staging.events",
                "project": "data-platform",
                "location": "us-east-1",
                "namespace": "company.analytics",
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.TransformAvro",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "TransformAvro",
                "type": "io.kestra.plugin.serdes.avro.AvroToIon",
                "schema": "s3://my-bucket/schemas/events.avsc",
                "project": "data-platform",
                "location": "eu-west-1",
                "namespace": "company.etl",
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.RunPipeline",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "RunPipeline",
                "type": "io.kestra.plugin.azure.datafactory.CreateRun",
                "pipelineName": "nightly-transform",
                "project": "azure-pipelines",
                "location": "westeurope",
                "namespace": "company.azure",
            },
            "relationType": "SEQUENTIAL"
        }
    ],
    "edges": [
        {
            "source": "root.root-extraDetails",
            "target": "root.IngestData",
            "relation": {}
        },
        {
            "source": "root.IngestData",
            "target": "root.TransformAvro",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.TransformAvro",
            "target": "root.RunPipeline",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.RunPipeline",
            "target": "root.end-extraDetails",
            "relation": {}
        },
    ],
    "clusters": []
}
