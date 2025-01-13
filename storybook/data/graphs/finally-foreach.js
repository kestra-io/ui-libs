export default {
    "nodes": [
        {
            "uid": "root.root-55ezlo9nE1mbZR6KgjqAFK",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-6syfZ8MsuIexbX7lyOvXX2",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.each.root-3q4JK8Sq1XID5Ars1Z1ZO7",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.each.finally-5Hjpqe29GRt7sgW4ACYuVr",
            "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
        },
        {
            "uid": "root.each.end-4jajjdfVvwWJfL3i6xEBBu",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.each",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "each",
                "type": "io.kestra.plugin.core.flow.ForEach",
                "errors": [
                    {
                        "id": "e1",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    },
                    {
                        "id": "e2",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    }
                ],
                "tasks": [
                    {
                        "id": "if",
                        "type": "io.kestra.plugin.core.flow.If",
                        "condition": "{{ inputs.failed == false }}",
                        "then": [
                            {
                                "id": "ok",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            }
                        ],
                        "else": [
                            {
                                "id": "ko",
                                "type": "io.kestra.plugin.core.execution.Fail"
                            }
                        ]
                    }
                ],
                "values": "[\"1\", \"2\", \"3\"]",
                "concurrencyLimit": 0,
                "finally": [
                    {
                        "id": "a1",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    },
                    {
                        "id": "a2",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    }
                ]
            },
            "relationType": "DYNAMIC"
        },
        {
            "uid": "root.each.if.root-4h8RyUew5i1ZPwohUfdpOn",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.each.if.end-5oXv07BYcQnOzvPqSDzs11",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.each.if",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "if",
                "type": "io.kestra.plugin.core.flow.If",
                "condition": "{{ inputs.failed == false }}",
                "then": [
                    {
                        "id": "ok",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    }
                ],
                "else": [
                    {
                        "id": "ko",
                        "type": "io.kestra.plugin.core.execution.Fail"
                    }
                ]
            },
            "relationType": "CHOICE"
        },
        {
            "uid": "root.each.if.ok",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "ok",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.each.if.ko",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "ko",
                "type": "io.kestra.plugin.core.execution.Fail"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.each.e1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "ERROR",
            "task": {
                "id": "e1",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "ERROR"
        },
        {
            "uid": "root.each.e2",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "ERROR",
            "task": {
                "id": "e2",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "ERROR"
        },
        {
            "uid": "root.each.a1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "FINALLY",
            "task": {
                "id": "a1",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "FINALLY"
        },
        {
            "uid": "root.each.a2",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "branchType": "FINALLY",
            "task": {
                "id": "a2",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "FINALLY"
        }
    ],
    "edges": [
        {
            "source": "root.root-55ezlo9nE1mbZR6KgjqAFK",
            "target": "root.each.root-3q4JK8Sq1XID5Ars1Z1ZO7",
            "relation": {}
        },
        {
            "source": "root.each.end-4jajjdfVvwWJfL3i6xEBBu",
            "target": "root.end-6syfZ8MsuIexbX7lyOvXX2",
            "relation": {}
        },
        {
            "source": "root.each.e1",
            "target": "root.each.e2",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.each.finally-5Hjpqe29GRt7sgW4ACYuVr",
            "target": "root.each.a1",
            "relation": {
                "relationType": "DYNAMIC"
            }
        },
        {
            "source": "root.each",
            "target": "root.each.if.root-4h8RyUew5i1ZPwohUfdpOn",
            "relation": {
                "relationType": "DYNAMIC"
            }
        },
        {
            "source": "root.each.e2",
            "target": "root.each.finally-5Hjpqe29GRt7sgW4ACYuVr",
            "relation": {}
        },
        {
            "source": "root.each.root-3q4JK8Sq1XID5Ars1Z1ZO7",
            "target": "root.each.e1",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.each.root-3q4JK8Sq1XID5Ars1Z1ZO7",
            "target": "root.each",
            "relation": {}
        },
        {
            "source": "root.each.a1",
            "target": "root.each.a2",
            "relation": {
                "relationType": "DYNAMIC"
            }
        },
        {
            "source": "root.each.a2",
            "target": "root.each.end-4jajjdfVvwWJfL3i6xEBBu",
            "relation": {}
        },
        {
            "source": "root.each.if.end-5oXv07BYcQnOzvPqSDzs11",
            "target": "root.each.finally-5Hjpqe29GRt7sgW4ACYuVr",
            "relation": {}
        },
        {
            "source": "root.each.if",
            "target": "root.each.if.ko",
            "relation": {
                "relationType": "CHOICE",
                "value": "else"
            }
        },
        {
            "source": "root.each.if.root-4h8RyUew5i1ZPwohUfdpOn",
            "target": "root.each.if",
            "relation": {}
        },
        {
            "source": "root.each.if",
            "target": "root.each.if.ok",
            "relation": {
                "relationType": "CHOICE",
                "value": "then"
            }
        },
        {
            "source": "root.each.if.ko",
            "target": "root.each.if.end-5oXv07BYcQnOzvPqSDzs11",
            "relation": {}
        },
        {
            "source": "root.each.if.ok",
            "target": "root.each.if.end-5oXv07BYcQnOzvPqSDzs11",
            "relation": {}
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.each",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "DYNAMIC",
                "taskNode": {
                    "uid": "root.each",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "each",
                        "type": "io.kestra.plugin.core.flow.ForEach",
                        "errors": [
                            {
                                "id": "e1",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            },
                            {
                                "id": "e2",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            }
                        ],
                        "tasks": [
                            {
                                "id": "if",
                                "type": "io.kestra.plugin.core.flow.If",
                                "condition": "{{ inputs.failed == false }}",
                                "then": [
                                    {
                                        "id": "ok",
                                        "type": "io.kestra.plugin.core.debug.Return",
                                        "format": "{{ task.id }}"
                                    }
                                ],
                                "else": [
                                    {
                                        "id": "ko",
                                        "type": "io.kestra.plugin.core.execution.Fail"
                                    }
                                ]
                            }
                        ],
                        "values": "[\"1\", \"2\", \"3\"]",
                        "concurrencyLimit": 0,
                        "finally": [
                            {
                                "id": "a1",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            },
                            {
                                "id": "a2",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            }
                        ]
                    },
                    "relationType": "DYNAMIC"
                },
                "finally": {
                    "uid": "root.each.finally-5Hjpqe29GRt7sgW4ACYuVr",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.each.root-3q4JK8Sq1XID5Ars1Z1ZO7",
                "root.each.finally-5Hjpqe29GRt7sgW4ACYuVr",
                "root.each.end-4jajjdfVvwWJfL3i6xEBBu",
                "root.each",
                "cluster_root.each.if",
                "root.each.if.root-4h8RyUew5i1ZPwohUfdpOn",
                "root.each.if.end-5oXv07BYcQnOzvPqSDzs11",
                "root.each.e1",
                "root.each.e2",
                "root.each.a1",
                "root.each.a2"
            ],
            "parents": [],
            "start": "root.each.root-3q4JK8Sq1XID5Ars1Z1ZO7",
            "end": "root.each.end-4jajjdfVvwWJfL3i6xEBBu"
        },
        {
            "cluster": {
                "uid": "cluster_root.each.if",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "CHOICE",
                "taskNode": {
                    "uid": "root.each.if",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "if",
                        "type": "io.kestra.plugin.core.flow.If",
                        "condition": "{{ inputs.failed == false }}",
                        "then": [
                            {
                                "id": "ok",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            }
                        ],
                        "else": [
                            {
                                "id": "ko",
                                "type": "io.kestra.plugin.core.execution.Fail"
                            }
                        ]
                    },
                    "relationType": "CHOICE"
                },
                "finally": {
                    "uid": "if.finally-2QQrRh3s87sVA96UabtBV0",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.each.if.root-4h8RyUew5i1ZPwohUfdpOn",
                "root.each.if.end-5oXv07BYcQnOzvPqSDzs11",
                "root.each.if",
                "root.each.if.ok",
                "root.each.if.ko"
            ],
            "parents": [
                "cluster_root.each"
            ],
            "start": "root.each.if.root-4h8RyUew5i1ZPwohUfdpOn",
            "end": "root.each.if.end-5oXv07BYcQnOzvPqSDzs11"
        }
    ]
}
