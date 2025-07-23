import type {ComputedRef, InjectionKey} from "vue"

export const EXECUTION_INJECTION_KEY = Symbol("execution-injection-key") as InjectionKey<ComputedRef<any>>
export const SUBFLOWS_EXECUTIONS_INJECTION_KEY = Symbol("subflows-executions-injection-key") as InjectionKey<ComputedRef<Record<string, any[]>>>
export const PLAYGROUND_ENABLED_INJECTION_KEY = Symbol("playground-enabled-injection-key") as InjectionKey<ComputedRef<boolean>>