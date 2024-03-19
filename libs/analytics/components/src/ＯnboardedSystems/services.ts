import { smartZoneApi as basedSmartZoneApi } from '@acx-ui/store'

export type OnboardedSystem = {
  device_id: string
  device_metadata: {
    serial_number: string
    cluster_name: string
    alto: boolean
    controller_version: string
    onboarder: {
      user_id: string
      account_id: string
    }
  },
  healthz: {
    timestamp: number
    healthz: Object
  }
  ap_list: Object & { aps: Object[] }
  ap_filter: Object & { aps: Object[] }
  created_at: string
  updated_at: string
  account_id: string
  onboarded: boolean
  device_name: string
  state: string
  state_errors: string[]
  msg_proxy_updated_at: string
  ctrl_msg_updated_at: string
  error_details: Record<string, {
    http_status_code: number | null,
    http_body: {
      errorCode?: number
      errorType?: string
      message?: string
      error?: string
    } | string | null
  }>
  sz_updated_at: string
  can_delete: boolean
}

export const smartZoneApi = basedSmartZoneApi.injectEndpoints({
  endpoints: (build) => ({
    fetchSmartZoneList: build.query<OnboardedSystem[], string[]>({
      query: (tenants) => ({
        url: '/smartzones',
        method: 'get',
        credentials: 'include',
        headers: { 'x-mlisa-tenant-ids': JSON.stringify(tenants) }
      }),
      providesTags: [{ type: 'SMARTZONE', id: 'list' }]
    }),
    deleteSmartZone: build.mutation<string, { id: string, tenants: string[] }>({
      query: ({ id, tenants }) => ({
        url: `/smartzones/${id}/delete`,
        method: 'delete',
        credentials: 'include',
        headers: { 'x-mlisa-tenant-ids': JSON.stringify(tenants) }
      }),
      invalidatesTags: [{ type: 'SMARTZONE', id: 'list' }]
    })
  })
})

export const {
  useFetchSmartZoneListQuery
} = smartZoneApi

export function useDeleteSmartZone () {
  const [deleteSmartZone, response] = smartZoneApi.useDeleteSmartZoneMutation()
  return { deleteSmartZone, response }
}
