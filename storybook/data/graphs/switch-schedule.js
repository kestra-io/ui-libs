export default {
    "nodes": [
        {
            "uid": "root.root-95EOVuzuCjxUbzMGobWQs",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-3J3lNt8V06dWnUFiKZdOId",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.Triggers.root-61OYrnmAXj8psmhCpqZqGs",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.Triggers.end-6uYz4Nszjq6ByQQWucgVL6",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.Triggers.schedule-every-min",
            "type": "io.kestra.core.models.hierarchies.GraphTrigger",
            "triggerDeclaration": {
                "id": "schedule-every-min",
                "type": "io.kestra.plugin.core.trigger.Schedule",
                "cron": "* * * * *"
            }
        },
        {
            "uid": "root.Triggers.schedule-5-min",
            "type": "io.kestra.core.models.hierarchies.GraphTrigger",
            "triggerDeclaration": {
                "id": "schedule-5-min",
                "type": "io.kestra.plugin.core.trigger.Schedule",
                "cron": "*/5 * * * *"
            }
        },
        {
            "uid": "root.parent-seq.root-2Lzx4nXtZXkeBsIBTIgO2k",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.parent-seq",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "parent-seq",
                "type": "io.kestra.plugin.core.flow.Switch",
                "value": "{{inputs.string}}",
                "cases": {
                    "FIRST": [
                        {
                            "id": "t1",
                            "type": "io.kestra.plugin.core.debug.Return",
                            "format": "{{task.id}} > {{taskrun.startDate}}"
                        }
                    ],
                    "SECOND": [
                        {
                            "id": "t2",
                            "type": "io.kestra.plugin.core.debug.Return",
                            "format": "{{task.id}} > {{taskrun.startDate}}"
                        },
                        {
                            "id": "t2_sub",
                            "type": "io.kestra.plugin.core.debug.Return",
                            "format": "{{task.id}} > {{taskrun.startDate}}"
                        }
                    ],
                    "THIRD": [
                        {
                            "id": "t3",
                            "type": "io.kestra.plugin.core.flow.Sequential",
                            "errors": [
                                {
                                    "id": "error-t1",
                                    "type": "io.kestra.plugin.core.debug.Return",
                                    "format": "Error Trigger ! {{task.id}}"
                                }
                            ],
                            "tasks": [
                                {
                                    "id": "failed",
                                    "type": "io.kestra.plugin.core.execution.Fail"
                                }
                            ]
                        }
                    ]
                },
                "defaults": [
                    {
                        "id": "default",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{task.id}} > {{ inputs.def }} > {{taskrun.startDate}}"
                    }
                ]
            },
            "relationType": "CHOICE"
        },
        {
            "uid": "root.parent-seq.default",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "default",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{task.id}} > {{ inputs.def }} > {{taskrun.startDate}}"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.parent-seq.t3",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t3",
                "type": "io.kestra.plugin.core.flow.Sequential",
                "errors": [
                    {
                        "id": "error-t1",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "Error Trigger ! {{task.id}}"
                    }
                ],
                "tasks": [
                    {
                        "id": "failed",
                        "type": "io.kestra.plugin.core.execution.Fail"
                    }
                ]
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.parent-seq.t3.failed",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "failed",
                "type": "io.kestra.plugin.core.execution.Fail"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.parent-seq.t3.error-t1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "ERROR",
            "task": {
                "id": "error-t1",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "Error Trigger ! {{task.id}}"
            },
            "relationType": "ERROR"
        },
        {
            "uid": "root.parent-seq.t2",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t2",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{task.id}} > {{taskrun.startDate}}"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.parent-seq.t2_sub",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t2_sub",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{task.id}} > {{taskrun.startDate}}"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.parent-seq.t1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t1",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{task.id}} > {{taskrun.startDate}}"
            },
            "relationType": "SEQUENTIAL"
        }
    ],
    "edges": [
        {
            "source": "root.Triggers.end-6uYz4Nszjq6ByQQWucgVL6",
            "target": "root.root-95EOVuzuCjxUbzMGobWQs",
            "relation": {}
        },
        {
            "source": "root.root-95EOVuzuCjxUbzMGobWQs",
            "target": "root.parent-seq.root-2Lzx4nXtZXkeBsIBTIgO2k",
            "relation": {}
        },
        {
            "source": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
            "target": "root.end-3J3lNt8V06dWnUFiKZdOId",
            "relation": {}
        },
        {
            "source": "root.Triggers.schedule-every-min",
            "target": "root.Triggers.end-6uYz4Nszjq6ByQQWucgVL6",
            "relation": {}
        },
        {
            "source": "root.Triggers.root-61OYrnmAXj8psmhCpqZqGs",
            "target": "root.Triggers.schedule-every-min",
            "relation": {}
        },
        {
            "source": "root.Triggers.schedule-5-min",
            "target": "root.Triggers.end-6uYz4Nszjq6ByQQWucgVL6",
            "relation": {}
        },
        {
            "source": "root.Triggers.root-61OYrnmAXj8psmhCpqZqGs",
            "target": "root.Triggers.schedule-5-min",
            "relation": {}
        },
        {
            "source": "root.parent-seq",
            "target": "root.parent-seq.default",
            "relation": {
                "relationType": "CHOICE",
                "value": "defaults"
            }
        },
        {
            "source": "root.parent-seq",
            "target": "root.parent-seq.t2",
            "relation": {
                "relationType": "CHOICE",
                "value": "SECOND"
            }
        },
        {
            "source": "root.parent-seq.t2",
            "target": "root.parent-seq.t2_sub",
            "relation": {
                "relationType": "SEQUENTIAL",
                "value": "SECOND"
            }
        },
        {
            "source": "root.parent-seq",
            "target": "root.parent-seq.t1",
            "relation": {
                "relationType": "CHOICE",
                "value": "FIRST"
            }
        },
        {
            "source": "root.parent-seq.t1",
            "target": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
            "relation": {}
        },
        {
            "source": "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3",
            "target": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
            "relation": {}
        },
        {
            "source": "root.parent-seq.root-2Lzx4nXtZXkeBsIBTIgO2k",
            "target": "root.parent-seq",
            "relation": {}
        },
        {
            "source": "root.parent-seq",
            "target": "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
            "relation": {
                "relationType": "CHOICE",
                "value": "THIRD"
            }
        },
        {
            "source": "root.parent-seq.t2_sub",
            "target": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
            "relation": {}
        },
        {
            "source": "root.parent-seq.default",
            "target": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
            "relation": {}
        },
        {
            "source": "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
            "target": "root.parent-seq.t3",
            "relation": {}
        },
        {
            "source": "root.parent-seq.t3.failed",
            "target": "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3",
            "relation": {}
        },
        {
            "source": "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
            "target": "root.parent-seq.t3.error-t1",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.parent-seq.t3",
            "target": "root.parent-seq.t3.failed",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.parent-seq.t3.error-t1",
            "target": "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3",
            "relation": {}
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.Triggers",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "finally": {
                    "uid": "root.Triggers.finally-3P7G0KoJdYXm9dSKqZ9sxR",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.Triggers.root-61OYrnmAXj8psmhCpqZqGs",
                "root.Triggers.end-6uYz4Nszjq6ByQQWucgVL6",
                "root.Triggers.schedule-every-min",
                "root.Triggers.schedule-5-min"
            ],
            "parents": [],
            "start": "root.Triggers.root-61OYrnmAXj8psmhCpqZqGs",
            "end": "root.Triggers.end-6uYz4Nszjq6ByQQWucgVL6"
        },
        {
            "cluster": {
                "uid": "cluster_root.parent-seq",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "CHOICE",
                "taskNode": {
                    "uid": "root.parent-seq",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "parent-seq",
                        "type": "io.kestra.plugin.core.flow.Switch",
                        "value": "{{inputs.string}}",
                        "cases": {
                            "FIRST": [
                                {
                                    "id": "t1",
                                    "type": "io.kestra.plugin.core.debug.Return",
                                    "format": "{{task.id}} > {{taskrun.startDate}}"
                                }
                            ],
                            "SECOND": [
                                {
                                    "id": "t2",
                                    "type": "io.kestra.plugin.core.debug.Return",
                                    "format": "{{task.id}} > {{taskrun.startDate}}"
                                },
                                {
                                    "id": "t2_sub",
                                    "type": "io.kestra.plugin.core.debug.Return",
                                    "format": "{{task.id}} > {{taskrun.startDate}}"
                                }
                            ],
                            "THIRD": [
                                {
                                    "id": "t3",
                                    "type": "io.kestra.plugin.core.flow.Sequential",
                                    "errors": [
                                        {
                                            "id": "error-t1",
                                            "type": "io.kestra.plugin.core.debug.Return",
                                            "format": "Error Trigger ! {{task.id}}"
                                        }
                                    ],
                                    "tasks": [
                                        {
                                            "id": "failed",
                                            "type": "io.kestra.plugin.core.execution.Fail"
                                        }
                                    ]
                                }
                            ]
                        },
                        "defaults": [
                            {
                                "id": "default",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{task.id}} > {{ inputs.def }} > {{taskrun.startDate}}"
                            }
                        ]
                    },
                    "relationType": "CHOICE"
                },
                "finally": {
                    "uid": "parent-seq.finally-5zaDywpzK8MVYTCWDLUE8A",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.parent-seq.root-2Lzx4nXtZXkeBsIBTIgO2k",
                "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd",
                "root.parent-seq",
                "root.parent-seq.default",
                "cluster_root.parent-seq.t3",
                "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
                "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3",
                "root.parent-seq.t2",
                "root.parent-seq.t2_sub",
                "root.parent-seq.t1"
            ],
            "parents": [],
            "start": "root.parent-seq.root-2Lzx4nXtZXkeBsIBTIgO2k",
            "end": "root.parent-seq.end-4tiT5KChhzaFZYOsk8lXNd"
        },
        {
            "cluster": {
                "uid": "cluster_root.parent-seq.t3",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "SEQUENTIAL",
                "taskNode": {
                    "uid": "root.parent-seq.t3",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "t3",
                        "type": "io.kestra.plugin.core.flow.Sequential",
                        "errors": [
                            {
                                "id": "error-t1",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "Error Trigger ! {{task.id}}"
                            }
                        ],
                        "tasks": [
                            {
                                "id": "failed",
                                "type": "io.kestra.plugin.core.execution.Fail"
                            }
                        ]
                    },
                    "relationType": "SEQUENTIAL"
                },
                "finally": {
                    "uid": "t3.finally-6Rjy4iRv8DEf80VA0EPWCb",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
                "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3",
                "root.parent-seq.t3",
                "root.parent-seq.t3.failed",
                "root.parent-seq.t3.error-t1"
            ],
            "parents": [
                "cluster_root.parent-seq"
            ],
            "start": "root.parent-seq.t3.root-37lx5Ik4eIUxdu1EbjygwD",
            "end": "root.parent-seq.t3.end-5tKwnnznBfYAmB6TuFiXs3"
        }
    ]
}
