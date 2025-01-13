export default {
    "nodes": [
        {
            "uid": "root.root-2KmoIge30kmQlIf5zckxM3",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-3RcmCSlTxNg9Bhxy8GIXVT",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.failed",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "failed",
                "type": "io.kestra.plugin.core.execution.Fail"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.t2",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "ERROR",
            "task": {
                "id": "t2",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "{%- for log in errorLogs() -%}\n- task: {{ log.taskId }}, message: {{ log.message }}\n{%- endfor -%}\n"
            },
            "relationType": "ERROR"
        },
        {
            "uid": "root.t3.root-5VJEl8QeKowb0W7hfwzs6F",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot",
            "branchType": "ERROR"
        },
        {
            "uid": "root.t3.end-2ipJjxvP0XStWnUf7GQD5x",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd",
            "branchType": "ERROR"
        },
        {
            "uid": "root.t3",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "ERROR",
            "task": {
                "id": "t3",
                "type": "io.kestra.plugin.core.flow.Parallel",
                "tasks": [
                    {
                        "id": "t3-t1",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1-t1",
                                "type": "io.kestra.plugin.core.flow.Parallel",
                                "tasks": [
                                    {
                                        "id": "t3-t1-t1-t1",
                                        "type": "io.kestra.plugin.core.flow.Parallel",
                                        "tasks": [
                                            {
                                                "id": "t3-t1-t1-t1-last",
                                                "type": "io.kestra.plugin.core.log.Log",
                                                "message": "t3-t1-t1-t1-last : {{task.id}}"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.t3.t3-t1.root-6Jzgfp9dP31W1hIdQwA6LV",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.t3.t3-t1.end-Xvnl7zLubt2BXnvqoo3wD",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.t3.t3-t1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t3-t1",
                "type": "io.kestra.plugin.core.flow.Parallel",
                "tasks": [
                    {
                        "id": "t3-t1-t1",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1-t1-t1",
                                "type": "io.kestra.plugin.core.flow.Parallel",
                                "tasks": [
                                    {
                                        "id": "t3-t1-t1-t1-last",
                                        "type": "io.kestra.plugin.core.log.Log",
                                        "message": "t3-t1-t1-t1-last : {{task.id}}"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1.root-10ERh79ibrSlDGPx4yrSQS",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1.end-762gxVHiLAgTfwMoMm7uJL",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t3-t1-t1",
                "type": "io.kestra.plugin.core.flow.Parallel",
                "tasks": [
                    {
                        "id": "t3-t1-t1-t1",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1-t1-t1-last",
                                "type": "io.kestra.plugin.core.log.Log",
                                "message": "t3-t1-t1-t1-last : {{task.id}}"
                            }
                        ]
                    }
                ]
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.root-5IifHab0NyYSuj26dr78kC",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.end-1SeE6GLPFVvlFpquSg5SFR",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t3-t1-t1-t1",
                "type": "io.kestra.plugin.core.flow.Parallel",
                "tasks": [
                    {
                        "id": "t3-t1-t1-t1-last",
                        "type": "io.kestra.plugin.core.log.Log",
                        "message": "t3-t1-t1-t1-last : {{task.id}}"
                    }
                ]
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.t3-t1-t1-t1-last",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "t3-t1-t1-t1-last",
                "type": "io.kestra.plugin.core.log.Log",
                "message": "t3-t1-t1-t1-last : {{task.id}}"
            },
            "relationType": "PARALLEL"
        }
    ],
    "edges": [
        {
            "source": "root.t2",
            "target": "root.t3.root-5VJEl8QeKowb0W7hfwzs6F",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.root-2KmoIge30kmQlIf5zckxM3",
            "target": "root.failed",
            "relation": {}
        },
        {
            "source": "root.t3.end-2ipJjxvP0XStWnUf7GQD5x",
            "target": "root.end-3RcmCSlTxNg9Bhxy8GIXVT",
            "relation": {}
        },
        {
            "source": "root.root-2KmoIge30kmQlIf5zckxM3",
            "target": "root.t2",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.failed",
            "target": "root.end-3RcmCSlTxNg9Bhxy8GIXVT",
            "relation": {}
        },
        {
            "source": "root.t3",
            "target": "root.t3.t3-t1.root-6Jzgfp9dP31W1hIdQwA6LV",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.t3.t3-t1.end-Xvnl7zLubt2BXnvqoo3wD",
            "target": "root.t3.end-2ipJjxvP0XStWnUf7GQD5x",
            "relation": {}
        },
        {
            "source": "root.t3.root-5VJEl8QeKowb0W7hfwzs6F",
            "target": "root.t3",
            "relation": {}
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1.end-762gxVHiLAgTfwMoMm7uJL",
            "target": "root.t3.t3-t1.end-Xvnl7zLubt2BXnvqoo3wD",
            "relation": {}
        },
        {
            "source": "root.t3.t3-t1.root-6Jzgfp9dP31W1hIdQwA6LV",
            "target": "root.t3.t3-t1",
            "relation": {}
        },
        {
            "source": "root.t3.t3-t1",
            "target": "root.t3.t3-t1.t3-t1-t1.root-10ERh79ibrSlDGPx4yrSQS",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1.root-10ERh79ibrSlDGPx4yrSQS",
            "target": "root.t3.t3-t1.t3-t1-t1",
            "relation": {}
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1",
            "target": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.root-5IifHab0NyYSuj26dr78kC",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.end-1SeE6GLPFVvlFpquSg5SFR",
            "target": "root.t3.t3-t1.t3-t1-t1.end-762gxVHiLAgTfwMoMm7uJL",
            "relation": {}
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.root-5IifHab0NyYSuj26dr78kC",
            "target": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
            "relation": {}
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
            "target": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.t3-t1-t1-t1-last",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.t3-t1-t1-t1-last",
            "target": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.end-1SeE6GLPFVvlFpquSg5SFR",
            "relation": {}
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.t3",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "branchType": "ERROR",
                "relationType": "PARALLEL",
                "taskNode": {
                    "uid": "root.t3",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "branchType": "ERROR",
                    "task": {
                        "id": "t3",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1",
                                "type": "io.kestra.plugin.core.flow.Parallel",
                                "tasks": [
                                    {
                                        "id": "t3-t1-t1",
                                        "type": "io.kestra.plugin.core.flow.Parallel",
                                        "tasks": [
                                            {
                                                "id": "t3-t1-t1-t1",
                                                "type": "io.kestra.plugin.core.flow.Parallel",
                                                "tasks": [
                                                    {
                                                        "id": "t3-t1-t1-t1-last",
                                                        "type": "io.kestra.plugin.core.log.Log",
                                                        "message": "t3-t1-t1-t1-last : {{task.id}}"
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "relationType": "PARALLEL"
                },
                "finally": {
                    "uid": "t3.finally-2drQjaFneyQ4QqMg4Qu46l",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.t3.root-5VJEl8QeKowb0W7hfwzs6F",
                "root.t3.end-2ipJjxvP0XStWnUf7GQD5x",
                "root.t3",
                "cluster_root.t3.t3-t1",
                "root.t3.t3-t1.root-6Jzgfp9dP31W1hIdQwA6LV",
                "root.t3.t3-t1.end-Xvnl7zLubt2BXnvqoo3wD"
            ],
            "parents": [],
            "start": "root.t3.root-5VJEl8QeKowb0W7hfwzs6F",
            "end": "root.t3.end-2ipJjxvP0XStWnUf7GQD5x"
        },
        {
            "cluster": {
                "uid": "cluster_root.t3.t3-t1",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "PARALLEL",
                "taskNode": {
                    "uid": "root.t3.t3-t1",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "t3-t1",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1-t1",
                                "type": "io.kestra.plugin.core.flow.Parallel",
                                "tasks": [
                                    {
                                        "id": "t3-t1-t1-t1",
                                        "type": "io.kestra.plugin.core.flow.Parallel",
                                        "tasks": [
                                            {
                                                "id": "t3-t1-t1-t1-last",
                                                "type": "io.kestra.plugin.core.log.Log",
                                                "message": "t3-t1-t1-t1-last : {{task.id}}"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "relationType": "PARALLEL"
                },
                "finally": {
                    "uid": "t3-t1.finally-5cBN5XBkpjHoUmrygwHfch",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.t3.t3-t1.root-6Jzgfp9dP31W1hIdQwA6LV",
                "root.t3.t3-t1.end-Xvnl7zLubt2BXnvqoo3wD",
                "root.t3.t3-t1",
                "cluster_root.t3.t3-t1.t3-t1-t1",
                "root.t3.t3-t1.t3-t1-t1.root-10ERh79ibrSlDGPx4yrSQS",
                "root.t3.t3-t1.t3-t1-t1.end-762gxVHiLAgTfwMoMm7uJL"
            ],
            "parents": [
                "cluster_root.t3"
            ],
            "start": "root.t3.t3-t1.root-6Jzgfp9dP31W1hIdQwA6LV",
            "end": "root.t3.t3-t1.end-Xvnl7zLubt2BXnvqoo3wD"
        },
        {
            "cluster": {
                "uid": "cluster_root.t3.t3-t1.t3-t1-t1",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "PARALLEL",
                "taskNode": {
                    "uid": "root.t3.t3-t1.t3-t1-t1",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "t3-t1-t1",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1-t1-t1",
                                "type": "io.kestra.plugin.core.flow.Parallel",
                                "tasks": [
                                    {
                                        "id": "t3-t1-t1-t1-last",
                                        "type": "io.kestra.plugin.core.log.Log",
                                        "message": "t3-t1-t1-t1-last : {{task.id}}"
                                    }
                                ]
                            }
                        ]
                    },
                    "relationType": "PARALLEL"
                },
                "finally": {
                    "uid": "t3-t1-t1.finally-XD415yGLmG8A9QweDBnix",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.t3.t3-t1.t3-t1-t1.root-10ERh79ibrSlDGPx4yrSQS",
                "root.t3.t3-t1.t3-t1-t1.end-762gxVHiLAgTfwMoMm7uJL",
                "root.t3.t3-t1.t3-t1-t1",
                "cluster_root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
                "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.root-5IifHab0NyYSuj26dr78kC",
                "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.end-1SeE6GLPFVvlFpquSg5SFR"
            ],
            "parents": [
                "cluster_root.t3",
                "cluster_root.t3.t3-t1"
            ],
            "start": "root.t3.t3-t1.t3-t1-t1.root-10ERh79ibrSlDGPx4yrSQS",
            "end": "root.t3.t3-t1.t3-t1-t1.end-762gxVHiLAgTfwMoMm7uJL"
        },
        {
            "cluster": {
                "uid": "cluster_root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "PARALLEL",
                "taskNode": {
                    "uid": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "t3-t1-t1-t1",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "t3-t1-t1-t1-last",
                                "type": "io.kestra.plugin.core.log.Log",
                                "message": "t3-t1-t1-t1-last : {{task.id}}"
                            }
                        ]
                    },
                    "relationType": "PARALLEL"
                },
                "finally": {
                    "uid": "t3-t1-t1-t1.finally-6fYO0L0PGsTTRMgZCaq4xJ",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.root-5IifHab0NyYSuj26dr78kC",
                "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.end-1SeE6GLPFVvlFpquSg5SFR",
                "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1",
                "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.t3-t1-t1-t1-last"
            ],
            "parents": [
                "cluster_root.t3",
                "cluster_root.t3.t3-t1",
                "cluster_root.t3.t3-t1.t3-t1-t1"
            ],
            "start": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.root-5IifHab0NyYSuj26dr78kC",
            "end": "root.t3.t3-t1.t3-t1-t1.t3-t1-t1-t1.end-1SeE6GLPFVvlFpquSg5SFR"
        }
    ]
}
