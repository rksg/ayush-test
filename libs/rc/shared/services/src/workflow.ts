
import {
  createNewTableHttpRequest,
  TableChangePayload,
  transferNewResToTableResult,
  transferToNewTablePaginationParams,
  Workflow,
  WorkflowUrls,
  NewAPITableResult,
  TableResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  UIConfiguration
} from '@acx-ui/rc/utils'
import { baseWorkflowApi }   from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'




export const workflowApi = baseWorkflowApi.injectEndpoints({
  endpoints: build => ({
    addWorkflow: build.mutation<Workflow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WorkflowUrls.createWorkflow, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Workflow', id: 'LIST' }]
    }),
    deleteWorkflow: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.deleteWorkflow, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Workflow', id: 'ID' }]
    }),
    getWorkflowById: build.query<Workflow, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.getWorkflowDetail, params)
        return {
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW',
            'PUBLISH_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'ID' }
            ]))
          })
        })
      },
      providesTags: [
        { type: 'Workflow', id: 'ID' }
      ]
    }),
    updateWorkflow: build.mutation<Workflow, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WorkflowUrls.updateWorkflow, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Workflow' }]
    }),
    searchWorkflowList: build.query<TableResult<Workflow>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: WorkflowUrls.searchWorkflows,
          params,
          payload: payload as TableChangePayload
        })

        return {
          ...req,
          body: {
            ...Object.assign({}, payload),
            ...transferToNewTablePaginationParams (payload as TableChangePayload)
          }
        }
      },
      transformResponse (result: NewAPITableResult<Workflow>) {
        return transferNewResToTableResult<Workflow>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW',
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW',
            'PUBLISH_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Workflow', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    searchInProgressWorkflowList: build.query<TableResult<Workflow>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: WorkflowUrls.searchInProgressWorkflows,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req,
          body: {
            ...Object.assign({}, payload),
            ...transferToNewTablePaginationParams (payload as TableChangePayload)
          }
        }
      },
      transformResponse (result: NewAPITableResult<Workflow>) {
        return transferNewResToTableResult<Workflow>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW',
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW',
            'PUBLISH_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Workflow', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getUIConfiguration: build.query<UIConfiguration, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.getWorkflowUIConfig, params)
        return {
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'WorkflowUIConfig', id: 'ID' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [
        { type: 'WorkflowUIConfig', id: 'ID' }
      ],
      extraOptions: { maxRetries: 5 }
    }),
    updateUIConfiguration: build.mutation<UIConfiguration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WorkflowUrls.updateWorkflowUIConfig, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'WorkflowUIConfig', id: 'ID' }]
    }),
    resetUIConfiguration: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.resetWorkflowUIConfig, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'WorkflowUIConfig', id: 'ID' }]
    })
  })
})

export const {
  useAddWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowByIdQuery,
  useLazyGetWorkflowByIdQuery,
  useUpdateWorkflowMutation,
  useSearchWorkflowListQuery,
  useLazySearchWorkflowListQuery,
  useSearchInProgressWorkflowListQuery,
  useLazySearchInProgressWorkflowListQuery,
  useGetUIConfigurationQuery,
  useLazyGetUIConfigurationQuery,
  useUpdateUIConfigurationMutation
} = workflowApi
