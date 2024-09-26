import {computed as vueComputed} from "vue";

export const useRuntimeConfig = () => ({
    public: {
        mdc: {
            headings: {
                anchorLinks: true
            }
        }
    }
});
export const computed = vueComputed;
export const resolveComponent = () => undefined;
export default {};