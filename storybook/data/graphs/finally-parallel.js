export default {
    "nodes": [
        {
            "uid": "root.root-2G8D6VjHvda1xXSGSdUY4Q",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-6hJUTovDtsKzJtjiOUqj24",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.seq.root-5ghUFTjVvoZCH80JohimjZ",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
        },
        {
            "uid": "root.seq.end-5b71gLTg9kDZgMi8rV5ghE",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.seq",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "seq",
                "type": "io.kestra.plugin.core.flow.Parallel",
                "tasks": [
                    {
                        "id": "p1",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    },
                    {
                        "id": "p2",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    },
                    {
                        "id": "p3",
                        "type": "io.kestra.plugin.core.debug.Return",
                        "format": "{{ task.id }}"
                    },
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
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.seq.p1",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "p1",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.seq.p2",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "p2",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.seq.p3",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "p3",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ task.id }}"
            },
            "relationType": "PARALLEL"
        },
        {
            "uid": "root.seq.if.root-1rjinjJ9a1IJpDwW0urpq2",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.seq.if.end-5HduTUYAJhBf2PXorWt205",
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
            "source": "root.root-2G8D6VjHvda1xXSGSdUY4Q",
            "target": "root.seq.root-5ghUFTjVvoZCH80JohimjZ",
            "relation": {}
        },
        {
            "source": "root.seq.end-5b71gLTg9kDZgMi8rV5ghE",
            "target": "root.end-6hJUTovDtsKzJtjiOUqj24",
            "relation": {}
        },
        {
            "source": "root.seq",
            "target": "root.seq.p1",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.seq.a2",
            "target": "root.seq.end-5b71gLTg9kDZgMi8rV5ghE",
            "relation": {}
        },
        {
            "source": "root.seq",
            "target": "root.seq.p3",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.seq.root-5ghUFTjVvoZCH80JohimjZ",
            "target": "root.seq.e1",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.seq.p1",
            "target": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "relation": {}
        },
        {
            "source": "root.seq.if.end-5HduTUYAJhBf2PXorWt205",
            "target": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "relation": {}
        },
        {
            "source": "root.seq.p2",
            "target": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "relation": {}
        },
        {
            "source": "root.seq.p3",
            "target": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "relation": {}
        },
        {
            "source": "root.seq.e2",
            "target": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "relation": {}
        },
        {
            "source": "root.seq",
            "target": "root.seq.p2",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.seq.root-5ghUFTjVvoZCH80JohimjZ",
            "target": "root.seq",
            "relation": {}
        },
        {
            "source": "root.seq.e1",
            "target": "root.seq.e2",
            "relation": {
                "relationType": "ERROR"
            }
        },
        {
            "source": "root.seq.a1",
            "target": "root.seq.a2",
            "relation": {
                "relationType": "FINALLY"
            }
        },
        {
            "source": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
            "target": "root.seq.a1",
            "relation": {
                "relationType": "PARALLEL"
            }
        },
        {
            "source": "root.seq",
            "target": "root.seq.if.root-1rjinjJ9a1IJpDwW0urpq2",
            "relation": {
                "relationType": "PARALLEL"
            }
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
            "source": "root.seq.if.ok",
            "target": "root.seq.if.end-5HduTUYAJhBf2PXorWt205",
            "relation": {}
        },
        {
            "source": "root.seq.if.root-1rjinjJ9a1IJpDwW0urpq2",
            "target": "root.seq.if",
            "relation": {}
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
            "source": "root.seq.if.ko",
            "target": "root.seq.if.end-5HduTUYAJhBf2PXorWt205",
            "relation": {}
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.seq",
                "type": "io.kestra.core.models.hierarchies.GraphCluster",
                "relationType": "PARALLEL",
                "taskNode": {
                    "uid": "root.seq",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "seq",
                        "type": "io.kestra.plugin.core.flow.Parallel",
                        "tasks": [
                            {
                                "id": "p1",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            },
                            {
                                "id": "p2",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            },
                            {
                                "id": "p3",
                                "type": "io.kestra.plugin.core.debug.Return",
                                "format": "{{ task.id }}"
                            },
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
                    "relationType": "PARALLEL"
                },
                "finally": {
                    "uid": "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.seq.root-5ghUFTjVvoZCH80JohimjZ",
                "root.seq.finally-3I9I76gdUchHQCKVzTucr2",
                "root.seq.end-5b71gLTg9kDZgMi8rV5ghE",
                "root.seq",
                "root.seq.p1",
                "root.seq.p2",
                "root.seq.p3",
                "cluster_root.seq.if",
                "root.seq.if.root-1rjinjJ9a1IJpDwW0urpq2",
                "root.seq.if.end-5HduTUYAJhBf2PXorWt205",
                "root.seq.e1",
                "root.seq.e2",
                "root.seq.a1",
                "root.seq.a2"
            ],
            "parents": [],
            "start": "root.seq.root-5ghUFTjVvoZCH80JohimjZ",
            "end": "root.seq.end-5b71gLTg9kDZgMi8rV5ghE"
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
                    "uid": "if.finally-3maMe0M06woEhnVqHKFylt",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.seq.if.root-1rjinjJ9a1IJpDwW0urpq2",
                "root.seq.if.end-5HduTUYAJhBf2PXorWt205",
                "root.seq.if",
                "root.seq.if.ok",
                "root.seq.if.ko"
            ],
            "parents": [
                "cluster_root.seq"
            ],
            "start": "root.seq.if.root-1rjinjJ9a1IJpDwW0urpq2",
            "end": "root.seq.if.end-5HduTUYAJhBf2PXorWt205"
        }
    ]
}
