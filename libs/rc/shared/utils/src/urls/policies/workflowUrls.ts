import { ApiInfo } from '@acx-ui/utils'


const WorkflowBaseUrl = '/workflows'
const WorkFlowActionDefinitionBaseUrl = '/workflowActionDefinitions'
const WorkflowStepBaseUrl = WorkflowBaseUrl + '/:policyId/steps'
const WorkflowSplitOptionsBaseUrl = WorkflowStepBaseUrl + '/:stepId/splitOptions'

const WorkflowActionBaseUrl = '/enrollmentActions'
const WorkflowActionTypeBaseUrl = '/enrollmentActions/actionTypes'

const paginationParams = '?size=:pageSize&page=:page&sort=:sort'
const excludeContent = 'excludeContent=:excludeContent'

type WorkflowBaseUrlType = 'searchWorkflows' | 'getWorkflowDetail'
  | 'createWorkflow' | 'updateWorkflow' | 'deleteWorkflow'
  | 'searchInProgressWorkflows' | 'getWorkflowUIConfig'
  | 'updateWorkflowUIConfig' | 'resetWorkflowUIConfig' | 'getWorkflowUIConfigImage'

type WorkflowActionUrlType = 'createAction' | 'patchAction'
  | 'deleteAction' | 'getActionById' | 'getAllActionsByType'
  | 'queryActions'

type WorkflowStepUrlType = 'createWorkflowOption' | 'getWorkflowOptionById'
  | 'getWorkflowOptionsByStepId' | 'createWorkflowStepUnderOption' | 'deleteSplitOptionById'
  | 'createWorkflowChildStep' | 'createWorkflowStep' | 'deleteWorkflowStep'
  | 'getWorkflowStepsById' | 'getWorkflowStepById'

type WorkflowActionDefinitionUrlType = 'getWorkflowActionDefinitions'
  | 'getWorkflowActionDefinitionById' | 'getWorkflowActionRequiredDefinitions'

type WorkflowUrlType =
  WorkflowBaseUrlType | WorkflowActionUrlType
  | WorkflowStepUrlType | WorkflowActionDefinitionUrlType

export const WorkflowUrls: { [key in WorkflowUrlType]: ApiInfo } = {
  /** Workflow endpoints */
  searchInProgressWorkflows: {
    method: 'post',
    url: `${WorkflowBaseUrl}/query${paginationParams}&${excludeContent}`,
    newApi: true
  },
  getWorkflowDetail: {
    method: 'get',
    url: `${WorkflowBaseUrl}/:id`,
    newApi: true
  },
  createWorkflow: {
    method: 'post',
    url: `${WorkflowBaseUrl}`,
    newApi: true
  },
  updateWorkflow: {
    method: 'PATCH',
    url: `${WorkflowBaseUrl}/:id`,
    newApi: true
  },
  deleteWorkflow: {
    method: 'delete',
    url: `${WorkflowBaseUrl}/:id`,
    newApi: true
  },
  searchWorkflows: {
    method: 'post',
    url: `${WorkflowBaseUrl}/:id/versions/query${paginationParams}&${excludeContent}`,
    newApi: true
  },
  getWorkflowUIConfig: {
    method: 'get',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations`,
    newApi: true
  },
  updateWorkflowUIConfig: {
    method: 'post',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations`,
    newApi: true
  },
  resetWorkflowUIConfig: {
    method: 'delete',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations`,
    newApi: true
  },
  getWorkflowUIConfigImage: {
    method: 'get',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations/:imageType`
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
  },

  /** Workflow Enrollment Action Type API endpoints */
  getAllActionsByType: {
    method: 'get',
    url: `${WorkflowActionTypeBaseUrl}/:actionType${paginationParams}`
  }
}
