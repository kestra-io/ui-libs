export const SECTIONS = {
  TASKS: "TASKS",
  TRIGGERS: "TRIGGERS",
  TASK_RUNNERS: "TASK_RUNNERS",
} as const;

export const EVENTS = {
  EDIT: "edit",
  DELETE: "delete",
  SHOW_DESCRIPTION: "showDescription",
  COLLAPSE: "collapse",
  EXPAND: "expand",
  OPEN_LINK: "openLink",
  ADD_TASK: "addTask",
  SHOW_LOGS: "showLogs",
  MOUSE_OVER: "mouseover",
  MOUSE_LEAVE: "mouseleave",
  ADD_ERROR: "addError",
  EXPAND_DEPENDENCIES: "expandDependencies",
  SHOW_CONDITION: "showCondition",
} as const;

export const CLUSTER_PREFIX = "cluster_";

export const stateGlobalChartTypes = {
  EXECUTIONS: "executions",
  TASKRUNS: "taskruns",
} as const;

export const logDisplayTypes = {
  ALL: "all",
  ERROR: "error",
  HIDDEN: "hidden",
  DEFAULT: "all",
} as const;

export const NODE_SIZES = {
  TASK_WIDTH: 184,
  TASK_HEIGHT: 44,
  TRIGGER_WIDTH: 184,
  TRIGGER_HEIGHT: 44,
  DOT_WIDTH: 5,
  DOT_HEIGHT: 5,
  COLLAPSED_CLUSTER_WIDTH: 150,
  COLLAPSED_CLUSTER_HEIGHT: 44,
  TRIGGER_CLUSTER_WIDTH: 350,
  TRIGGER_CLUSTER_HEIGHT: 180,
} as const;

export const editorViewTypes = {
  STORAGE_KEY: "view-type",
  SOURCE: "source",
  SOURCE_TOPOLOGY: "source-topology",
  SOURCE_DOC: "source-doc",
  TOPOLOGY: "topology",
  SOURCE_BLUEPRINTS: "source-blueprints",
} as const;

export const storageKeys = {
  DISPLAY_EXECUTIONS_COLUMNS: "displayExecutionsColumns",
  DISPLAY_FLOW_EXECUTIONS_COLUMNS: "displayFlowExecutionsColumns",
  SELECTED_TENANT: "selectedTenant",
  EXECUTE_FLOW_BEHAVIOUR: "executeFlowBehaviour",
  SHOW_CHART: "showChart",
  SHOW_FLOWS_CHART: "showFlowsChart",
  SHOW_LOGS_CHART: "showLogsChart",
  DEFAULT_NAMESPACE: "defaultNamespace",
  LATEST_NAMESPACE: "latestNamespace",
  PAGINATION_SIZE: "paginationSize",
  IMPERSONATE: "impersonate",
  EDITOR_VIEW_TYPE: "editorViewType",
} as const;

export const executeFlowBehaviours = {
  SAME_TAB: "same tab",
  NEW_TAB: "new tab",
} as const;

export const stateDisplayValues = {
  INPROGRESS: "IN-PROGRESS",
} as const;
