import {
  VenueDefaultApGroup,
  AddApGroup,
  ApGroup,
  ApGroupConfigTemplateUrlsInfo,
  TableResult,
  ApGroupViewModel,
  onSocketActivityChanged,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'

import {getApGroupFn, getApGroupsListFn, updateApGroupFn} from '../apGroupUtils'
import { commonQueryFn }     from '../servicePolicy.utils'

export const apGroupConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getVenueTemplateDefaultApGroup: build.query<VenueDefaultApGroup[], RequestPayload>({
      query: commonQueryFn(ApGroupConfigTemplateUrlsInfo.getVenueDefaultApGroup),
      transformResponse (result: VenueDefaultApGroup) {
        return Array.isArray(result) ? result : [result]
      },
      providesTags: [{ type: 'VenueTemplateApGroup', id: 'LIST' }]
    }),
    getApGroupTemplate: build.query<ApGroup, RequestPayload>({
      queryFn: getApGroupFn(true),
      providesTags: [{ type: 'ApGroupTemplate', id: 'LIST' }]
    }),
    getApGroupsTemplateList: build.query<TableResult<ApGroupViewModel>, RequestPayload>({
      queryFn: getApGroupsListFn(true),
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'ApGroupTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddApGroupTemplate',
            'UpdateApGroupTemplate',
            'DeleteApGroupsTemplate',
            'AddApGroupLegacyTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(apGroupConfigTemplateApi.util.invalidateTags([{ type: 'ApGroupTemplate', id: 'LIST' }]))
          })
        })
      }
    }),
    addApGroupTemplate: build.mutation<AddApGroup, RequestPayload>({
      query: commonQueryFn(ApGroupConfigTemplateUrlsInfo.addApGroup),
      invalidatesTags: [
        { type: 'VenueTemplateApGroup', id: 'LIST' },
        { type: 'ApGroupTemplate', id: 'LIST' }
      ]
    }),
    updateApGroupTemplate: build.mutation<AddApGroup, RequestPayload>({
      queryFn: updateApGroupFn(true),
      invalidatesTags: [
        { type: 'VenueTemplateApGroup', id: 'LIST' },
        { type: 'ApGroupTemplate', id: 'LIST' }
      ]
    }),
    deleteApGroupsTemplate: build.mutation<ApGroup[], RequestPayload>({
      query: commonQueryFn(ApGroupConfigTemplateUrlsInfo.deleteApGroup),
      invalidatesTags: [{ type: 'ApGroupTemplate', id: 'LIST' }]
    })
  })
})

export const {
  useGetVenueTemplateDefaultApGroupQuery,
  useGetApGroupTemplateQuery,
  useLazyGetVenueTemplateDefaultApGroupQuery,
  useGetApGroupsTemplateListQuery,
  useLazyGetApGroupsTemplateListQuery,
  useAddApGroupTemplateMutation,
  useUpdateApGroupTemplateMutation,
  useDeleteApGroupsTemplateMutation
} = apGroupConfigTemplateApi
