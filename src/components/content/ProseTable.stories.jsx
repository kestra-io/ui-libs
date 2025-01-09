import ProseTable from "./ProseTable.vue"

export default {
    title: "Components/Content/ProseTable",
    component: ProseTable
}

export const Default = {
    render: () => ({
        components: {ProseTable},
        template: `
            <ProseTable>
                <thead>
                    <tr>
                        <th>Header 1</th>
                        <th>Header 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cell 1</td>
                        <td>Cell 2</td>
                    </tr>
                    <tr>
                        <td>Cell 3</td>
                        <td>Cell 4</td>
                    </tr>
                </tbody>
            </ProseTable>
        `
    })
} 