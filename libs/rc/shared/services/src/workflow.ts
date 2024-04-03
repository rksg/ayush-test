import {
  ActionBase,
  AupAction,
  DataPromptAction, GenericActionData,
  NewTableResult, onActivityMessageReceived,
  onSocketActivityChanged, SplitOption, TableResult, Workflow, WorkflowActionDefinition,
  WorkflowStep,
  WorkflowUrls
} from '@acx-ui/rc/utils'
import { baseWorkflowApi }   from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

// FIXME: think about should I declare this variable here or not?
type UnionAction = AupAction | DataPromptAction

export const workflowApi = baseWorkflowApi.injectEndpoints({
  endpoints: build => ({
    queryWorkflowList:
    build.query<TableResult<Workflow>, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.queryWorkflowList, params),
          body: payload
        }
      }
    }),
    /** Workflow Action Definitions */
    getWorkflowActionDefinitionList:
      build.query<NewTableResult<WorkflowActionDefinition>, RequestPayload>({
        query: ({ params }) => {
          return {
            ...createHttpRequest(WorkflowUrls.getWorkflowActionDefinitions, params)
          }
        }
      }),
    getWorkflowActionRequiredDefinitions: build.query<NewTableResult<WorkflowActionDefinition> ,RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WorkflowUrls.getWorkflowActionRequiredDefinitions, params)
        }
      }
    }),
    /** Workflow Step API */
    createWorkflowStep: build.mutation<WorkflowStep, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.createWorkflowStep, params),
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Step' }]
    }),
    createWorkflowChildStep: build.mutation<WorkflowStep, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.createWorkflowChildStep, params),
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Step' }]
    }),
    deleteWorkflowStepById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteWorkflowStep, params)
      },
      invalidatesTags: [{ type: 'Step' }]
    }),
    // FIXME: need to check response payload
    getWorkflowStepsById: build.query<NewTableResult<WorkflowStep>, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowStepsById, params)
      },
      providesTags: [{ type: 'Step', id: 'LIST' }]
    }),
    // FIXME: need to check
    getWorkflowStepById: build.query<WorkflowStep, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowStepById, params)
      },
      providesTags: [{ type: 'Step', id: 'ID' }]
    }),

    /** Workflow SplitOptions API */
    createWorkflowStepUnderOption: build.mutation<WorkflowStep, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.createWorkflowStepUnderOption, params),
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Step' }]
    }),
    createSplitOption: build.mutation<SplitOption, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.createWorkflowOption, params),
          body: payload
        }
      },
      // FIXME: Change the `type` to SplitOption
      invalidatesTags: [{ type: 'Step' }]
    }),
    getSplitOptionById: build.query<SplitOption, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowStepById, params)
      },
      // FIXME: Change the `type` to SplitOption
      providesTags: [{ type: 'Step' }]
    }),
    getSplitOptionsByStepId: build.query<NewTableResult<SplitOption>, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowOptionsByStepId, params)
      },
      // FIXME: Change the `type` to SplitOption
      providesTags: [{ type: 'Step' }]
    }),
    deleteSplitOptionById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteSplitOptionById, params)
      },
      // FIXME: Change the `type` to SplitOption
      invalidatesTags: [{ type: 'Step' }]
    }),


    /** Workflow Actions API */
    createAction: build.mutation<UnionAction, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.createAction, params),
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Action', id: 'LIST' }]
    }),
    getActionById: build.query<GenericActionData, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getActionById, params)
      },
      providesTags: [{ type: 'Action', id: 'ID' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW_ACTION'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Action', id: 'ID' }
            ]))
          })
        })
      }
    }),
    getAllActionsByType: build.query<NewTableResult<ActionBase>, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getAllActionsByType, params)
      },
      providesTags: [{ type: 'Action', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW_ACTION',
            'UPDATE_WORKFLOW_ACTION'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Action', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    patchAction: build.mutation<UnionAction, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.patchAction, params),
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Action' }]
    }),
    deleteActionById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteAction, params)
      },
      invalidatesTags: [{ type: 'Action', id: 'LIST' }]
    })
  })
})

export const {
  useQueryWorkflowListQuery
} = workflowApi

export const {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowActionRequiredDefinitionsQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} = workflowApi

export const {
  useCreateWorkflowStepMutation,
  useCreateWorkflowChildStepMutation,
  useGetWorkflowStepByIdQuery,
  useGetWorkflowStepsByIdQuery,
  useDeleteWorkflowStepByIdMutation,
  useCreateSplitOptionMutation,
  useCreateWorkflowStepUnderOptionMutation,
  useGetSplitOptionsByStepIdQuery,
  useGetSplitOptionByIdQuery,
  useDeleteSplitOptionByIdMutation
} = workflowApi

export const {
  useCreateActionMutation,
  useGetActionByIdQuery,
  useGetAllActionsByTypeQuery,
  usePatchActionMutation,
  useDeleteActionByIdMutation
} = workflowApi
