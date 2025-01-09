import Mermaid from "./Mermaid.vue"

export default {
    title: "Components/Content/Mermaid",
    component: Mermaid
}

export const FlowChart = {
    render: () => ({
        setup() {
            return () => <Mermaid>
                {`graph TD
                A[Start] --> B{Is it?}
                B -- Yes --> C[OK]
                B -- No --> D[End]`}
            </Mermaid>
        }
    })
}

export const SequenceDiagram = {
    render: () => ({
        setup() {
            return () => <Mermaid>
                 {`sequenceDiagram
                Alice->>John: Hello John, how are you?
                John-->>Alice: Great!`}
            </Mermaid>
        }
    })
} 