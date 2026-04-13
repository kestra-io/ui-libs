import {ref, onMounted, watchEffect} from "vue"
import MDCRenderer from "../../../src/components/content/MDCRenderer.vue"
import getMDCParser from "../../../src/composables/getMDCParser"

export default {
    title: "Components/Content/MDCRenderer",
    component: MDCRenderer,
    argTypes: {
        markdown: {
            control: {type: "text"}
        }
    }
}

// ─── BasicMarkdown ────────────────────────────────────────────────────────────

const BASIC_MARKDOWN = `# Heading One

## Heading Two

### Heading Three

This is a paragraph with **bold text**, *italic text*, and a [link to example](https://example.com).

Another paragraph demonstrating inline \`code\` and more prose.
`

export const BasicMarkdown = {
    render: () => ({
        setup() {
            const parsed = ref(null)
            onMounted(async () => {
                const parser = await getMDCParser()
                parsed.value = await parser(BASIC_MARKDOWN)
            })
            return () => parsed.value
                ? <MDCRenderer body={parsed.value.body} data={parsed.value.data} />
                : <div>Loading...</div>
        }
    })
}

// ─── CodeBlocks ───────────────────────────────────────────────────────────────

const CODE_BLOCKS_MARKDOWN = `# Code Blocks

Here is a syntax-highlighted Python snippet:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(fibonacci(i))
\`\`\`

And a JavaScript example:

\`\`\`javascript
const greet = (name) => {
    console.log(\`Hello, \${name}!\`)
}

greet("World")
\`\`\`

And a YAML config:

\`\`\`yaml
id: hello-world
namespace: company.team

tasks:
  - id: greet
    type: io.kestra.core.tasks.log.Log
    message: Hello World!
\`\`\`
`

export const CodeBlocks = {
    render: () => ({
        setup() {
            const parsed = ref(null)
            onMounted(async () => {
                const parser = await getMDCParser()
                parsed.value = await parser(CODE_BLOCKS_MARKDOWN)
            })
            return () => parsed.value
                ? <MDCRenderer body={parsed.value.body} data={parsed.value.data} />
                : <div>Loading...</div>
        }
    })
}

// ─── TableAndBlockquote ───────────────────────────────────────────────────────

const TABLE_BLOCKQUOTE_MARKDOWN = `# Table and Blockquote

## Comparison Table

| Feature        | Supported | Notes                   |
|----------------|-----------|-------------------------|
| Headings       | Yes       | H1 through H6           |
| Bold / Italic  | Yes       | Standard markdown        |
| Tables         | Yes       | GFM-style tables        |
| Code blocks    | Yes       | Shiki syntax highlight  |
| MDC components | Yes       | Custom Vue components   |

## Blockquote

> This is a blockquote.
> It can span multiple lines and contains important information
> that should stand out from the surrounding content.

> **Note:** Nested **bold** inside a blockquote also works correctly.
`

export const TableAndBlockquote = {
    render: () => ({
        setup() {
            const parsed = ref(null)
            onMounted(async () => {
                const parser = await getMDCParser()
                parsed.value = await parser(TABLE_BLOCKQUOTE_MARKDOWN)
            })
            return () => parsed.value
                ? <MDCRenderer body={parsed.value.body} data={parsed.value.data} />
                : <div>Loading...</div>
        }
    })
}

// ─── CustomComponents ─────────────────────────────────────────────────────────

const CUSTOM_COMPONENTS_MARKDOWN = `# MDC Custom Components

## Alert Component

::alert{type="info"}
This is an **info** alert rendered via the MDC \`::alert\` component syntax.
::

::alert{type="warning"}
This is a **warning** alert. Take care before proceeding.
::

::alert{type="danger"}
This is a **danger** alert indicating a critical issue.
::

::alert{type="success"}
This is a **success** alert confirming the operation completed.
::

## Collapse Component

::collapse{title="Click to expand hidden details"}
This content is hidden inside a Collapse component.

- Item one
- Item two
- Item three
::
`

export const CustomComponents = {
    render: () => ({
        setup() {
            const parsed = ref(null)
            onMounted(async () => {
                const parser = await getMDCParser()
                parsed.value = await parser(CUSTOM_COMPONENTS_MARKDOWN)
            })
            return () => parsed.value
                ? <MDCRenderer body={parsed.value.body} data={parsed.value.data} />
                : <div>Loading...</div>
        }
    })
}

// ─── MermaidDiagram ───────────────────────────────────────────────────────────

const MERMAID_MARKDOWN = `# Mermaid Diagram

A flowchart rendered via a mermaid code fence:

\`\`\`mermaid
graph TD
    A[Start] --> B{Condition?}
    B -- Yes --> C[Process A]
    B -- No --> D[Process B]
    C --> E[End]
    D --> E[End]
\`\`\`

A sequence diagram:

\`\`\`mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: GET /api/data
    Server-->>Client: 200 OK + JSON
\`\`\`
`

export const MermaidDiagram = {
    render: () => ({
        setup() {
            const parsed = ref(null)
            onMounted(async () => {
                const parser = await getMDCParser()
                parsed.value = await parser(MERMAID_MARKDOWN)
            })
            return () => parsed.value
                ? <MDCRenderer body={parsed.value.body} data={parsed.value.data} />
                : <div>Loading...</div>
        }
    })
}

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground = {
    args: {
        markdown: `# Playground

Edit the **markdown** control in the panel below to see it rendered live.

- Item one
- Item two
- Item three

\`\`\`javascript
console.log("Hello from the playground!")
\`\`\`
`
    },
    render: (args) => ({
        setup() {
            const parsed = ref(null)
            watchEffect(async () => {
                const markdown = args.markdown
                parsed.value = null
                const parser = await getMDCParser()
                parsed.value = await parser(markdown)
            })
            return () => parsed.value
                ? <MDCRenderer body={parsed.value.body} data={parsed.value.data} />
                : <div>Loading...</div>
        }
    })
}
