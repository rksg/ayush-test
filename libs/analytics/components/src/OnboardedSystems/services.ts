import { get, isEmpty, partition } from 'lodash'
import { defineMessage }           from 'react-intl'

import { Tenant }                            from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { smartZoneApi as basedSmartZoneApi } from '@acx-ui/store'
import { getIntl }                           from '@acx-ui/utils'

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
      error?: string | null
    } | string | null
  }>
  sz_updated_at: string
  can_delete: boolean
}

export type FormattedOnboardedSystem = {
  status: string
  statusType: string
  errors: string[]
  name: string
  id: string
  addedTime:string
  formattedAddedTime: string
  lastUpdateTime: string
  canDelete: boolean,
  accountName: string
}

const smartZoneStateMap = {
  onboarded:
    defineMessage({ defaultMessage: 'Onboarded' }),
  offboarded:
    defineMessage({ defaultMessage: 'Offboarded' }),
  onboarding_queued:
    defineMessage({ defaultMessage: 'Onboarding: Queued' }),
  onboarding_update_sz_name:
    defineMessage({ defaultMessage: 'Onboarding: Update SZ name' }),
  onboarding_update_account_id:
    defineMessage({ defaultMessage: 'Onboarding: Update tenant association' }),
  onboarding_delete_data_connectors_and_streaming_profiles:
    defineMessage({ defaultMessage: 'Onboarding: Delete data connectors & streaming profiles' }),
  onboarding_create_data_connector:
    defineMessage({ defaultMessage: 'Onboarding: Create data connector' }),
  onboarding_create_data_streaming_profiles:
    defineMessage({ defaultMessage: 'Onboarding: Create streaming profiles' }),
  onboarding_set_hccd_for_all_zones:
    defineMessage({ defaultMessage: 'Onboarding: Enable reporting of connection failures' }),
  updating_ap_filter_list_queued:
    defineMessage({ defaultMessage: 'Assigning APs to license: Queued' }), // deprecated
  updating_ap_filter_list:
    defineMessage({ defaultMessage: 'Assigning APs to license' }), // deprecated
  updating_sz_configuration_queued:
    defineMessage({ defaultMessage: 'Updating SZ configuration: Queued' }),
  updating_sz_configuration:
    defineMessage({ defaultMessage: 'Updating SZ configuration' })
}

const apiServiceMap = {
  licensing_api_error: defineMessage({ defaultMessage: 'License API' }),
  rbac_api_error: defineMessage({ defaultMessage: 'Access control API' }),
  sz_api_error: defineMessage({ defaultMessage: 'SmartZone API' })
}

const sortOnboardedSystems = (
  smartzones: OnboardedSystem[],
  tenantId: string,
  tenantsMap: Record<string, Tenant>
) => {
  const [currentTenantSzs, otherSzs] = partition(smartzones, (sz) => sz.account_id === tenantId)
  otherSzs.sort((a, b) => (tenantsMap[a.account_id].name)
    .localeCompare(tenantsMap[b.account_id].name))
  return currentTenantSzs.concat(otherSzs)
}

const formatSmartZoneName = (name: string) => {
  return isEmpty(name) ? getIntl().$t({ defaultMessage: '[retrieving from SmartZone]' }) : name
}

const getStatusType = (state: keyof typeof smartZoneStateMap, errors: string[]) => {
  const ongoingWordings = ['onboarding', 'updating']
  if (!isEmpty(errors)) return 'error'
  if (ongoingWordings.some(word => state.startsWith(word))) return 'ongoing'
  if (state === 'onboarded') return 'onboarded'
  return 'offboarded'
}

const getStatusErrors = (data: OnboardedSystem, errors: string[]) => {
  const { $t } = getIntl()
  return isEmpty(errors)
    ? []
    : errors.map(error => {
      switch (error) {
        case 'poll_control_message_response_timeout':
          return $t({ defaultMessage: 'Control message response timeout' })
        case 'msg_proxy_no_data_received':
          return $t(
            { defaultMessage: 'Have not received data since {time}' },
            { time: formatter(DateFormatEnum.DateTimeFormat)(data.msg_proxy_updated_at) }
          )
        case 'sz_mgr_no_health_check_received':
          return $t(
            { defaultMessage: 'Have not received health check since {time}' },
            { time: formatter(DateFormatEnum.DateTimeFormat)(data.sz_updated_at) }
          )
        default:
          const { http_status_code: httpStatusCode, http_body } =
            data.error_details[error as keyof typeof data.error_details] ||
            { http_status_code: null, http_body: null }
          const httpBody = get(http_body, 'message') || get(http_body, 'error') || http_body
          return $t(
            // eslint-disable-next-line max-len
            { defaultMessage: '{error}: {httpBody}{isHttpStatusCode, select, true { (status code: {httpStatusCode})} other {}}' },
            {
              error: (error in apiServiceMap)
                ? $t(apiServiceMap[error as keyof typeof apiServiceMap]) : error,
              httpBody: typeof httpBody === 'string'
                ? httpBody
                : $t({ defaultMessage: 'Unknown error' })
              ,
              isHttpStatusCode: Boolean(httpStatusCode),
              httpStatusCode: httpStatusCode
            }
          )
      }
    })
}

export const smartZoneApi = basedSmartZoneApi.injectEndpoints({
  endpoints: (build) => ({
    fetchSmartZoneList: build.query<
      FormattedOnboardedSystem[], {
        tenants: Tenant[],
        tenantId: string
      }
    >({
      query: ({ tenants }) => {
        return {
          url: '/smartzones',
          method: 'get',
          credentials: 'include',
          headers: { 'x-mlisa-tenant-ids': JSON.stringify(tenants.map(t => t.id)) }
        }
      },
      providesTags: [{ type: 'SmartZone', id: 'list' }],
      transformResponse: (response: OnboardedSystem[], _, { tenants, tenantId }) => {
        const { $t } = getIntl()
        const tenantsMap = tenants.reduce((acc, tenant) => {
          acc[tenant.id] = tenant
          return acc
        }, {} as Record<string, Tenant>)
        return sortOnboardedSystems(response, tenantId, tenantsMap).map((data) => {
          const stateErrors = data.state_errors
          return {
            status: $t(smartZoneStateMap[data.state as keyof typeof smartZoneStateMap]),
            statusType: getStatusType(data.state as keyof typeof smartZoneStateMap, stateErrors),
            errors: getStatusErrors(data, stateErrors),
            name: formatSmartZoneName(data.device_name),
            id: data.device_id,
            addedTime: data.created_at,
            formattedAddedTime: formatter(DateFormatEnum.DateTimeFormat)(data.created_at),
            lastUpdateTime: data.sz_updated_at,
            canDelete: data.can_delete,
            accountName: tenantsMap[data.account_id].name
          }
        })
      }
    }),
    deleteSmartZone: build.mutation<string, { id: string, tenants: string[] }>({
      query: ({ id, tenants }) => ({
        url: `/smartzones/${id}/delete`,
        method: 'delete',
        credentials: 'include',
        headers: { 'x-mlisa-tenant-ids': JSON.stringify(tenants) }
      }),
      invalidatesTags: [{ type: 'SmartZone', id: 'list' }]
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
