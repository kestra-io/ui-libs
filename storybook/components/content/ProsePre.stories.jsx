import ProsePre from "../../../src/components/content/ProsePre.vue"

export default {
    title: "Components/Content/ProsePre",
    component: ProsePre,
    argTypes: {
        language: {control: "text"},
        code: {control: "text"},
        filename: {control: "text"},
        highlights: {control: "text"},
        meta: {control: "text"}
    }
}

export const Default = {
    args: {
        language: "javascript",
        code: "console.log('Hello World');",
        filename: "example.js",
        highlights: "",
        meta: ""
    }
}

export const MermaidDiagram = {
    args: {
        language: "mermaid",
        code: `
            graph TD
            A[Start] --> B{Is it?}
            B -- Yes --> C[OK]
            B -- No --> D[End]
        `,
        filename: "",
        highlights: "",
        meta: ""
    }
} 
