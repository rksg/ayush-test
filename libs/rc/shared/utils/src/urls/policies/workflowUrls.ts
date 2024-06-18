import { ApiInfo } from '@acx-ui/utils'

const WorkflowBaseUrl = ''

const paginationParams = '?size=:pageSize&page=:page&sort=:sort&excludeContent=:excludeContent'
type WorkflowUrlType = 'searchWorkflows' | 'getWorkflowDetail'
  | 'createWorkflow' | 'updateWorkflow' | 'deleteWorkflow'
  | 'searchInProgressWorkflows' | 'getWorkflowUIConfig'
  | 'updateWorkflowUIConfig' | 'resetWorkflowUIConfig'
export const WorkflowUrls: { [key in WorkflowUrlType]: ApiInfo } = {
  searchInProgressWorkflows: {
    method: 'post',
    url: `${WorkflowBaseUrl}/workflows/query${paginationParams}`,
    newApi: true
  },
  getWorkflowDetail: {
    method: 'get',
    url: `${WorkflowBaseUrl}/workflows/:id`,
    newApi: true
  },
  createWorkflow: {
    method: 'post',
    url: `${WorkflowBaseUrl}/workflows`,
    newApi: true
  },
  updateWorkflow: {
    method: 'PATCH',
    url: `${WorkflowBaseUrl}/workflows/:id`,
    newApi: true
  },
  deleteWorkflow: {
    method: 'delete',
    url: `${WorkflowBaseUrl}/workflows/:id`,
    newApi: true
  },
  searchWorkflows: {
    method: 'post',
    url: `${WorkflowBaseUrl}/workflows/:id/versions/query${paginationParams}`,
    newApi: true
  },
  getWorkflowUIConfig: {
    method: 'get',
    url: `${WorkflowBaseUrl}/workflows/:id/uiConfigurations`,
    newApi: true
  },
  updateWorkflowUIConfig: {
    method: 'post',
    url: `${WorkflowBaseUrl}/workflows/:id/uiConfigurations`,
    newApi: true
  },
  resetWorkflowUIConfig: {
    method: 'delete',
    url: `${WorkflowBaseUrl}/workflows/:id/uiConfigurations`,
    newApi: true
  }
}
