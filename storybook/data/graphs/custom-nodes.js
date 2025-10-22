export default {
    "nodes": [
        {
            "uid": "root.root-3sdgt4F8XAn9q6HXnzkRO3",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.end-5dkPd67MynOqyqsYhiXuMV",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.agent.root-54MLEPclL9Qewf8jepOent",
            "type": "io.kestra.core.models.hierarchies.GraphClusterRoot"
        },
        {
            "uid": "root.agent.end-7NKoyvGDZrFYcedVjZDUbr",
            "type": "io.kestra.core.models.hierarchies.GraphClusterEnd"
        },
        {
            "uid": "root.agent",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "agent",
                "type": "io.kestra.plugin.ai.agent.AIAgent",
                "prompt": "Execute a flow that best matches the {{inputs.use_case}} use case selected by the user. Use the following mapping of use cases to flow ids:\n- Business Automation: business-automation\n- Business Processes: business-processes\n- Data Engineering Pipeline: data-engineering-pipeline\n- Data Warehouse and Analytics: dwh-and-analytics\n- Infrastructure Automation: infrastructure-automation\n- Microservices and APIs: microservices-and-apis\n- Just Exploring: hello-world\nRemember that all those flows are in the tutorial namespace.\nReturn only the Execution URI with no extra characters - the structure of URL is {{ kestra.url ?? 'http://localhost:8080/'}}ui/<tenantId>/executions/<namespace>/<flowId>/<id>\n",
                "provider": {
                    "apiKey": "{{ kv('GEMINI_API_KEY', errorOnMissing=false) }}",
                    "type": "io.kestra.plugin.ai.provider.GoogleGemini",
                    "modelName": "gemini-2.5-flash"
                },
                "configuration": {},
                "tools": [
                    {
                        "type": "io.kestra.plugin.ai.tool.KestraFlow",
                        "inheritLabels": "false"
                    }
                ]
            },
            "relationType": "SEQUENTIAL"
        },
        {
            "uid": "root.agentder",
            "plugin": {
                "apiKey": "{{ kv('GEMINI_API_KEY', errorOnMissing=false) }}",
                "type": "io.kestra.plugin.ai.provider.GoogleGemini",
                "modelName": "gemini-2.5-flash"
            },
            "type": "io.kestra.core.models.hierarchies.CustomGraphNode"
        },
        {
            "uid": "root.agent0",
            "plugin": {
                "type": "io.kestra.plugin.ai.tool.KestraFlow",
                "inheritLabels": "false"
            },
            "type": "io.kestra.core.models.hierarchies.CustomGraphNode"
        },
        {
            "uid": "root.uri",
            "type": "io.kestra.core.models.hierarchies.GraphTask",
            "task": {
                "id": "uri",
                "type": "io.kestra.plugin.core.debug.Return",
                "format": "{{ (kestra.url ?? 'http://localhost:8080/') ~ 'ui/' ~ fromJson((outputs.agent.toolExecutions | first).result).tenantId ~ '/executions/tutorial/' ~ fromJson((outputs.agent.toolExecutions | first).result).flowId ~ '/' ~ fromJson((outputs.agent.toolExecutions | first).result).id }}"
            },
            "relationType": "SEQUENTIAL"
        }
    ],
    "edges": [
        {
            "source": "root.agent.end-7NKoyvGDZrFYcedVjZDUbr",
            "target": "root.uri",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.root-3sdgt4F8XAn9q6HXnzkRO3",
            "target": "root.agent.root-54MLEPclL9Qewf8jepOent",
            "relation": {}
        },
        {
            "source": "root.uri",
            "target": "root.end-5dkPd67MynOqyqsYhiXuMV",
            "relation": {}
        },
        {
            "source": "root.agent0",
            "target": "root.agent.end-7NKoyvGDZrFYcedVjZDUbr",
            "relation": {}
        },
        {
            "source": "root.agent.root-54MLEPclL9Qewf8jepOent",
            "target": "root.agent",
            "relation": {}
        },
        {
            "source": "root.agent",
            "target": "root.agent0",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        },
        {
            "source": "root.agentder",
            "target": "root.agent.end-7NKoyvGDZrFYcedVjZDUbr",
            "relation": {}
        },
        {
            "source": "root.agent",
            "target": "root.agentder",
            "relation": {
                "relationType": "SEQUENTIAL"
            }
        }
    ],
    "clusters": [
        {
            "cluster": {
                "uid": "cluster_root.agent",
                "type": "io.kestra.core.models.hierarchies.CustomGraphCluster",
                "relationType": "SEQUENTIAL",
                "taskNode": {
                    "uid": "root.agent",
                    "type": "io.kestra.core.models.hierarchies.GraphTask",
                    "task": {
                        "id": "agent",
                        "type": "io.kestra.plugin.ai.agent.AIAgent",
                        "prompt": "Execute a flow that best matches the {{inputs.use_case}} use case selected by the user. Use the following mapping of use cases to flow ids:\n- Business Automation: business-automation\n- Business Processes: business-processes\n- Data Engineering Pipeline: data-engineering-pipeline\n- Data Warehouse and Analytics: dwh-and-analytics\n- Infrastructure Automation: infrastructure-automation\n- Microservices and APIs: microservices-and-apis\n- Just Exploring: hello-world\nRemember that all those flows are in the tutorial namespace.\nReturn only the Execution URI with no extra characters - the structure of URL is {{ kestra.url ?? 'http://localhost:8080/'}}ui/<tenantId>/executions/<namespace>/<flowId>/<id>\n",
                        "provider": {
                            "apiKey": "{{ kv('GEMINI_API_KEY', errorOnMissing=false) }}",
                            "type": "io.kestra.plugin.ai.provider.GoogleGemini",
                            "modelName": "gemini-2.5-flash"
                        },
                        "configuration": {},
                        "tools": [
                            {
                                "type": "io.kestra.plugin.ai.tool.KestraFlow",
                                "inheritLabels": "false"
                            }
                        ]
                    },
                    "relationType": "SEQUENTIAL"
                },
                "finally": {
                    "uid": "agent.finally-6Tc1mZeoTLxuSRtehHM8vX",
                    "type": "io.kestra.core.models.hierarchies.GraphClusterFinally"
                }
            },
            "nodes": [
                "root.agent.root-54MLEPclL9Qewf8jepOent",
                "root.agent.end-7NKoyvGDZrFYcedVjZDUbr",
                "root.agent",
                "root.agentder",
                "root.agent0"
            ],
            "parents": [],
            "start": "root.agent.root-54MLEPclL9Qewf8jepOent",
            "end": "root.agent.end-7NKoyvGDZrFYcedVjZDUbr"
        }
    ]
}
