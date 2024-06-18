import { ApiInfo } from '@acx-ui/utils'


export const WorkflowBaseUrl = '/workflows'
export const WorkflowStepBaseUrl = WorkflowBaseUrl + '/:serviceId/steps'
export const WorkFlowActionDefinitionBaseUrl = '/workflowActionDefinitions'
export const WorkflowSplitOptionsBaseUrl = WorkflowStepBaseUrl + '/:stepId/splitOptions'

export const WorkflowActionBaseUrl = '/enrollmentActions'
export const WorkflowActionTypeBaseUrl = '/enrollmentActions/actionTypes'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'

type WorkFlowUrlType =
  'queryWorkflows' |
  'createWorkflowOption' | 'getWorkflowOptionById' | 'getWorkflowOptionsByStepId' |
  'createWorkflowStepUnderOption' | 'deleteSplitOptionById' |
  'createWorkflowChildStep' | 'createWorkflowStep' | 'deleteWorkflowStep' |
  'getWorkflowStepsById' | 'getWorkflowStepById' |
  'getWorkflowActionDefinitions' | 'getWorkflowActionDefinitionById' |
  'getWorkflowActionRequiredDefinitions' |
  'createAction' | 'patchAction' | 'deleteAction' | 'getActionById' |
  'getAllActionsByType' | 'queryActions'


export const WorkflowUrls: { [key in WorkFlowUrlType]: ApiInfo } = {
  queryWorkflows: {
    method: 'post',
    url: `${WorkflowBaseUrl}/query?excludeContent=false`
  },
  /** Workflow Action Definitions endpoints */
  getWorkflowActionDefinitions: {
    method: 'get',
    url: `${WorkFlowActionDefinitionBaseUrl}${paginationParams}`
  },
  getWorkflowActionDefinitionById: {
    method: 'get',
    url: `${WorkFlowActionDefinitionBaseUrl}/:definitionId`
  },
  getWorkflowActionRequiredDefinitions: {
    method: 'get',
    url: `${WorkFlowActionDefinitionBaseUrl}/:definitionId/requiredPriorDefinitions`
  },
  /** Workflow Step API endpoints */
  createWorkflowStep: {
    method: 'post',
    url: WorkflowStepBaseUrl
  },
  createWorkflowChildStep: {
    method: 'post',
    url: `${WorkflowStepBaseUrl}/:stepId/nextSteps`
  },
  deleteWorkflowStep: {
    method: 'delete',
    url: `${WorkflowStepBaseUrl}/:stepId`
  },
  getWorkflowStepsById: {
    method: 'get',
    url: `${WorkflowStepBaseUrl}${paginationParams}`
  },
  getWorkflowStepById: {
    method: 'get',
    url: `${WorkflowStepBaseUrl}/:stepId`
  },
  /** Workflow SplitStep API endpoints */
  createWorkflowOption: {
    method: 'post',
    url: `${WorkflowSplitOptionsBaseUrl}`
  },
  createWorkflowStepUnderOption: {
    method: 'post',
    url: `${WorkflowSplitOptionsBaseUrl}/:optionId/nextSteps`
  },
  getWorkflowOptionById: {
    method: 'get',
    url: `${WorkflowSplitOptionsBaseUrl}/:optionId`
  },
  getWorkflowOptionsByStepId: {
    method: 'get',
    url: WorkflowSplitOptionsBaseUrl
  },
  deleteSplitOptionById: {
    method: 'delete',
    url: `${WorkflowSplitOptionsBaseUrl}/:optionId`
  },

  /** Workflow Enrollment Action Type API endpoints */
  getAllActionsByType: {
    method: 'get',
    url: `${WorkflowActionTypeBaseUrl}/:actionType${paginationParams}`
  },

  /** Workflow Enrollment Actions API endpoints */
  createAction: {
    method: 'post',
    url: WorkflowActionBaseUrl
  },
  getActionById: {
    method: 'get',
    url: `${WorkflowActionBaseUrl}/:actionId`
  },
  patchAction: {
    method: 'PATCH',
    url: `${WorkflowActionBaseUrl}/:actionId`
  },
  deleteAction: {
    method: 'delete',
    url: `${WorkflowActionBaseUrl}/:actionId`
  },
  queryActions: {
    method: 'post',
    url: `${WorkflowActionBaseUrl}/query`
  }
}
