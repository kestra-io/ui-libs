export default {
    "nodes": [
        {
            "uid": "root.root-28wtc2Dx4yVEpoDzQ794yO",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-3qfy9clNotEJxMG1meMGE2",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.pause.root-4te0fCSs9DBAVD8EuqDWh4",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.pause.end-6WdtcBQqfluinaYKw4MSSp",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.pause",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "pause",
                "type": "io.kestra.plugin.core.flow.Pause",
                "tasks": [
                    {
                        "id": "subtask",
                        "type": "io.kestra.plugin.core.log.Log",
                        "message": "trigger after manual restart"
                    }
                ]
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.pause.subtask",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "subtask",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "trigger after manual restart"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.last",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "last",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{task.id}} > {{taskrun.startDate}}"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.failed-echo",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "ERROR",
            "task": {
                "id": "failed-echo",
                "type": "io.kestra.plugin.core.debug.Echo",
                "description": "Log the error",
                "format": "I'm failing {{task.id}}"
            },
            "relationType": "ERROR"
        }
    ],
    "edges": [
        {
            "source": "root.root-28wtc2Dx4yVEpoDzQ794yO",
            "target": "root.pause.root-4te0fCSs9DBAVD8EuqDWh4",
            "relation": {}
        },
        {
            "source": "root.last",
            "target": "root.end-3qfy9clNotEJxMG1meMGE2",
            "relation": {}
        },
        {
            "source": "root.root-28wtc2Dx4yVEpoDzQ794yO",
            "target": "root.failed-echo",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.pause.end-6WdtcBQqfluinaYKw4MSSp",
            "target": "root.last",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.failed-echo",
            "target": "root.end-3qfy9clNotEJxMG1meMGE2",
            "relation": {}
        },
        {
            "source": "root.pause.root-4te0fCSs9DBAVD8EuqDWh4",
            "target": "root.pause",
            "relation": {}
        },
        {
            "source": "root.pause",
            "target": "root.pause.subtask",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.pause.subtask",
            "target": "root.pause.end-6WdtcBQqfluinaYKw4MSSp",
            "relation": {}
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.pause",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "SEQUENTIAL",
                "taskNode": {
                    "uid": "root.pause",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "pause",
                        "type": "io.kestra.plugin.core.flow.Pause",
                        "tasks": [
                            {
                                "id": "subtask",
                                "type": "io.kestra.plugin.core.log.Log",
                                "message": "trigger after manual restart"
                            }
                        ]
                    },
                    "relationType": "SEQUENTIAL"
                },
                "finally": {
                    "uid": "pause.finally-5BD5B9QYdKiqhUfC7FrtfR",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.pause.root-4te0fCSs9DBAVD8EuqDWh4",
                "root.pause.end-6WdtcBQqfluinaYKw4MSSp",
                "root.pause",
                "root.pause.subtask"
            ],
            "parents": [],
            "start": "root.pause.root-4te0fCSs9DBAVD8EuqDWh4",
            "end": "root.pause.end-6WdtcBQqfluinaYKw4MSSp"
        }
    ]
}
