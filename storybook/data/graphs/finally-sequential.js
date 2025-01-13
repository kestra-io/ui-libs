export default {
    "nodes": [
        {
            "uid": "root.root-1YwWOrIUyvZTvrVF0u1lv2",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-fWVNnhWkzQ0heByGUvAxY",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.seq.root-4wM0xm2rg40WZGXzvDcvR5",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.seq.finally-411MwV4VpPpaXnY8C9f2eS",
            "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
        },
        {
            "uid": "root.seq.end-1yPLQfFFVsvTHxktLYDd37",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.seq",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "seq",
                "type": "io.kestra.plugin.core.flow.Sequential",
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
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.seq.if.root-4zup2f3sSsyQtuC8H1VMZc",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.seq.if",
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
            "uid": "root.seq.if.ok",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "ok",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.seq.if.ko",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "ko",
                "type": "io.kestra.plugin.core.execution.Fail"
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.seq.e1",
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
            "uid": "root.seq.e2",
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
            "uid": "root.seq.a1",
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
            "uid": "root.seq.a2",
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
            "source": "root.root-1YwWOrIUyvZTvrVF0u1lv2",
            "target": "root.seq.root-4wM0xm2rg40WZGXzvDcvR5",
            "relation": {}
        },
        {
            "source": "root.seq.end-1yPLQfFFVsvTHxktLYDd37",
            "target": "root.end-fWVNnhWkzQ0heByGUvAxY",
            "relation": {}
        },
        {
            "source": "root.seq",
            "target": "root.seq.if.root-4zup2f3sSsyQtuC8H1VMZc",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.seq.e2",
            "target": "root.seq.finally-411MwV4VpPpaXnY8C9f2eS",
            "relation": {}
        },
        {
            "source": "root.seq.a1",
            "target": "root.seq.a2",
            "relation": {
                "relationType": "FINALLY"
            }
        },
        {
            "source": "root.seq.finally-411MwV4VpPpaXnY8C9f2eS",
            "target": "root.seq.a1",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5",
            "target": "root.seq.finally-411MwV4VpPpaXnY8C9f2eS",
            "relation": {}
        },
        {
            "source": "root.seq.root-4wM0xm2rg40WZGXzvDcvR5",
            "target": "root.seq",
            "relation": {}
        },
        {
            "source": "root.seq.a2",
            "target": "root.seq.end-1yPLQfFFVsvTHxktLYDd37",
            "relation": {}
        },
        {
            "source": "root.seq.root-4wM0xm2rg40WZGXzvDcvR5",
            "target": "root.seq.e1",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.seq.e1",
            "target": "root.seq.e2",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.seq.if",
            "target": "root.seq.if.ok",
            "relation": {
                "relationType": "CHOICE",
                "value": "then"
            }
        },
        {
            "source": "root.seq.if.ok",
            "target": "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5",
            "relation": {}
        },
        {
            "source": "root.seq.if",
            "target": "root.seq.if.ko",
            "relation": {
                "relationType": "CHOICE",
                "value": "else"
            }
        },
        {
            "source": "root.seq.if.ko",
            "target": "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5",
            "relation": {}
        },
        {
            "source": "root.seq.if.root-4zup2f3sSsyQtuC8H1VMZc",
            "target": "root.seq.if",
            "relation": {}
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.seq",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "SEQUENTIAL",
                "taskNode": {
                    "uid": "root.seq",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "seq",
                        "type": "io.kestra.plugin.core.flow.Sequential",
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
                    "relationType": "SEQUENTIAL"
                },
                "finally": {
                    "uid": "root.seq.finally-411MwV4VpPpaXnY8C9f2eS",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.seq.root-4wM0xm2rg40WZGXzvDcvR5",
                "root.seq.finally-411MwV4VpPpaXnY8C9f2eS",
                "root.seq.end-1yPLQfFFVsvTHxktLYDd37",
                "root.seq",
                "cluster_root.seq.if",
                "root.seq.if.root-4zup2f3sSsyQtuC8H1VMZc",
                "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5",
                "root.seq.e1",
                "root.seq.e2",
                "root.seq.a1",
                "root.seq.a2"
            ],
            "parents": [],
            "start": "root.seq.root-4wM0xm2rg40WZGXzvDcvR5",
            "end": "root.seq.end-1yPLQfFFVsvTHxktLYDd37"
        },
        {
            "cluster": {
                "uid": "cluster_root.seq.if",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "CHOICE",
                "taskNode": {
                    "uid": "root.seq.if",
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
                    "uid": "if.finally-5nSNuAVl3nyCTgphIZPCgb",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.seq.if.root-4zup2f3sSsyQtuC8H1VMZc",
                "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5",
                "root.seq.if",
                "root.seq.if.ok",
                "root.seq.if.ko"
            ],
            "parents": [
                "cluster_root.seq"
            ],
            "start": "root.seq.if.root-4zup2f3sSsyQtuC8H1VMZc",
            "end": "root.seq.if.end-5bGQ87SfHrj75RbDT3PnS5"
        }
    ]
}
