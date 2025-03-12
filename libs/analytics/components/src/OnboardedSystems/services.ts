import { get, isEmpty }  from 'lodash'
import { defineMessage } from 'react-intl'

import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { TableResult }                       from '@acx-ui/rc/utils'
import { smartZoneApi as basedSmartZoneApi } from '@acx-ui/store'
import { RequestPayload }                    from '@acx-ui/types'
import { createHttpRequest, getIntl }        from '@acx-ui/utils'

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
  account_name: string
  status_type: string
}

export type FormattedOnboardedSystem = {
  status: string
  errors: string[]
  id: string
  lastUpdateTime: string
  canDelete: boolean,
} & SortingFieldsForSnakeCaseApiResponse

// This is for Ruby
type SortingFieldsForSnakeCaseApiResponse = {
  account_name: string,
  device_name: string,
  created_at: string,
  status_type: string
}

export type SmartZoneStatus = 'error' | 'offboarded' | 'onboarded' | 'ongoing'

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

const formatSmartZoneName = (name: string) => {
  return isEmpty(name) ? getIntl().$t({ defaultMessage: '[retrieving from SmartZone]' }) : name
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

const tenantIdsHeaderWithWildcard = {
  'x-mlisa-tenant-ids': '[*]'
}

export const smartZoneApi = basedSmartZoneApi.injectEndpoints({
  endpoints: (build) => ({
    getSmartZoneList: build.query<
      TableResult<FormattedOnboardedSystem>,
      RequestPayload
    >({
      query: ({ payload }) => {
        const extraCustomHeaders: Record<string, unknown> = {
          ...tenantIdsHeaderWithWildcard
        }
        const req = createHttpRequest(
          {
            url: '/analytics/api/rsa-mlisa-smartzone/v1/smartzones/query',
            method: 'post'
          },
          undefined, extraCustomHeaders)
        return {
          ...req,
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'SmartZone', id: 'list' }],
      transformResponse: (response: TableResult<OnboardedSystem>) => {
        const { $t } = getIntl()
        const viewDataList = response.data
          .map((data) => {
            const stateErrors = data.state_errors
            return {
              status: $t(smartZoneStateMap[data.state as keyof typeof smartZoneStateMap]),
              errors: getStatusErrors(data, stateErrors),
              id: data.device_id,
              lastUpdateTime: data.sz_updated_at,
              canDelete: data.can_delete,
              // Sorting fields
              created_at: formatter(DateFormatEnum.DateTimeFormat)(data.created_at),
              device_name: formatSmartZoneName(data.device_name),
              account_name: data.account_name,
              status_type: data.status_type
            }
          })
        return {
          data: viewDataList,
          page: response.page,
          totalCount: response.totalCount
        }
      }
    }),
    getDistinctSmartZoneStatus: build.query<
      { data: SmartZoneStatus[] },
      RequestPayload
    >({
      query: ({ payload }) => {
        const extraCustomHeaders: Record<string, unknown> = {
          ...tenantIdsHeaderWithWildcard
        }
        const req = createHttpRequest(
          {
            url: '/analytics/api/rsa-mlisa-smartzone/v1/smartzones/status/query',
            method: 'post'
          },
          undefined, extraCustomHeaders)
        return {
          ...req,
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'SmartZone', id: 'list' }]
    }),
    deleteSmartZone: build.mutation<string, { id: string }>({
      query: ({ id }) => ({
        url: `/smartzones/${id}/delete`,
        method: 'delete',
        credentials: 'include',
        headers: { ...tenantIdsHeaderWithWildcard }
      }),
      invalidatesTags: [{ type: 'SmartZone', id: 'list' }]
    })
  })
})

export const {
  useGetSmartZoneListQuery,
  useGetDistinctSmartZoneStatusQuery
} = smartZoneApi

export function useDeleteSmartZone () {
  const [deleteSmartZone, response] = smartZoneApi.useDeleteSmartZoneMutation()
  return { deleteSmartZone, response }
}
