import { DefaultHeader } from '@ant-design/pro-layout'
import { opsApis }       from 'libs/common/user/src/aiAllowedOperations'

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
  | 'cloneWorkflow' | 'nestedCloneWorkflow'

type WorkflowActionUrlType = 'createAction' | 'patchAction'
  | 'deleteAction' | 'getActionById' | 'getAllActionsByType'
  | 'queryActions' | 'uploadFile' | 'deleteFile' | 'getFile'

type WorkflowStepUrlType = 'createWorkflowOption' | 'getWorkflowOptionById'
  | 'getWorkflowOptionsByStepId' | 'createWorkflowStepUnderOption' | 'attachStepBeneathStep'
  | 'deleteSplitOptionById'
  | 'createWorkflowChildStep' | 'createWorkflowStep' | 'deleteWorkflowStep'
  | 'deleteWorkflowStepAndDescendants' | 'getWorkflowStepsById' | 'getWorkflowStepById'

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
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getWorkflowDetail: {
    method: 'get',
    url: `${WorkflowBaseUrl}/:id`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  createWorkflow: {
    method: 'post',
    url: `${WorkflowBaseUrl}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `POST:${WorkflowBaseUrl}`
  },
  updateWorkflow: {
    method: 'PATCH',
    url: `${WorkflowBaseUrl}/:id`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `PATCH:${WorkflowBaseUrl}/{id}`
  },
  deleteWorkflow: {
    method: 'delete',
    url: `${WorkflowBaseUrl}/:id`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `DELETE:${WorkflowBaseUrl}/{id}`
  },
  searchWorkflows: {
    method: 'post',
    url: `${WorkflowBaseUrl}/:id/versions/query${paginationParams}&${excludeContent}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getWorkflowUIConfig: {
    method: 'get',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  updateWorkflowUIConfig: {
    method: 'post',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations`,
    newApi: true,
    opsApi: `POST:${WorkflowBaseUrl}/{id}/uiConfigurations`
  },
  resetWorkflowUIConfig: {
    method: 'delete',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `DELETE:${WorkflowBaseUrl}/{id}/uiConfigurations`
  },
  getWorkflowUIConfigImage: {
    method: 'get',
    url: `${WorkflowBaseUrl}/:id/uiConfigurations/:imageType`,
    newApi: true
  },

  /** Workflow Action Definitions endpoints */
  getWorkflowActionDefinitions: {
    method: 'get',
    url: `${WorkFlowActionDefinitionBaseUrl}${paginationParams}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getWorkflowActionDefinitionById: {
    method: 'get',
    url: `${WorkFlowActionDefinitionBaseUrl}/:definitionId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getWorkflowActionRequiredDefinitions: {
    method: 'get',
    url: `${WorkFlowActionDefinitionBaseUrl}/:definitionId/requiredPriorDefinitions`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },

  /** Workflow Step API endpoints */
  createWorkflowStep: {
    method: 'post',
    url: WorkflowStepBaseUrl,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/workflows/{id}/steps'
  },
  createWorkflowChildStep: {
    method: 'post',
    url: `${WorkflowStepBaseUrl}/:stepId/nextSteps`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/workflows/{id}/steps/{id}/nextSteps'
  },
  attachStepBeneathStep: {
    method: 'put',
    url: `${WorkflowStepBaseUrl}/{stepId}/nextSteps/{detachedStepId}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'PUT:/workflows/{id}/steps/{id}/nextSteps/{id}'
  },
  deleteWorkflowStep: {
    method: 'delete',
    url: `${WorkflowStepBaseUrl}/:stepId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/workflows/{id}/steps/{id}'
  },
  deleteWorkflowStepAndDescendants: {
    method: 'delete',
    url: `${WorkflowStepBaseUrl}/:stepId/descendantSteps`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/workflows/{id}/steps/{id}/descendantSteps'
  },
  getWorkflowStepsById: {
    method: 'get',
    url: `${WorkflowStepBaseUrl}${paginationParams}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getWorkflowStepById: {
    method: 'get',
    url: `${WorkflowStepBaseUrl}/:stepId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },

  /** Workflow SplitStep API endpoints */
  createWorkflowOption: {
    method: 'post',
    url: `${WorkflowSplitOptionsBaseUrl}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/workflows/{id}/steps/{id}/splitOptions'
  },
  createWorkflowStepUnderOption: {
    method: 'post',
    url: `${WorkflowSplitOptionsBaseUrl}/:optionId/nextSteps`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'POST:/workflows/{id}/steps/{id}/splitOptions/{id}/nextSteps'
  },
  getWorkflowOptionById: {
    method: 'get',
    url: `${WorkflowSplitOptionsBaseUrl}/:optionId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  getWorkflowOptionsByStepId: {
    method: 'get',
    url: WorkflowSplitOptionsBaseUrl,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  deleteSplitOptionById: {
    method: 'delete',
    url: `${WorkflowSplitOptionsBaseUrl}/:optionId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: 'DELETE:/workflows/{id}/steps/{id}/splitOptions/{id}'
  },

  /** Workflow Enrollment Actions API endpoints */
  createAction: {
    method: 'post',
    url: WorkflowActionBaseUrl,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `POST:${WorkflowActionBaseUrl}`
  },
  getActionById: {
    method: 'get',
    url: `${WorkflowActionBaseUrl}/:actionId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  patchAction: {
    method: 'PATCH',
    url: `${WorkflowActionBaseUrl}/:actionId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `PATCH:${WorkflowActionBaseUrl}/{id}`
  },
  deleteAction: {
    method: 'delete',
    url: `${WorkflowActionBaseUrl}/:actionId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `DELETE:${WorkflowActionBaseUrl}/{id}`
  },
  queryActions: {
    method: 'post',
    url: `${WorkflowActionBaseUrl}/query`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },

  /** Workflow Enrollment Action Type API endpoints */
  getAllActionsByType: {
    method: 'get',
    url: `${WorkflowActionTypeBaseUrl}/:actionType${paginationParams}`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  uploadFile: {
    method: 'post',
    url: `${WorkflowActionBaseUrl}/files`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `POST:${WorkflowActionBaseUrl}/files`
  },
  deleteFile: {
    method: 'delete',
    url: `${WorkflowActionBaseUrl}/files/:fileId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `DELETE:${WorkflowActionBaseUrl}/files/{id}`
  },
  getFile: {
    method: 'get',
    url: `${WorkflowActionBaseUrl}/files/:fileId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    }
  },
  cloneWorkflow: {
    method: 'post',
    url: `${WorkflowBaseUrl}/:id/workflows`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `POST:${WorkflowBaseUrl}/{id}/workflows`
  },
  nestedCloneWorkflow: {
    method: 'post',
    url: `${WorkflowBaseUrl}/:id/steps/:stepId/nextSteps/workflows/:referencedWorkflowId`,
    newApi: true,
    defaultHeaders: {
      'Accept': 'application/vnd.ruckus.v1+json',
      'Content-Type': 'application/vnd.ruckus.v1+json'
    },
    opsApi: `POST:${WorkflowBaseUrl}/{id}/steps/{id}/nextSteps/workflows/{id}`
  }
}
