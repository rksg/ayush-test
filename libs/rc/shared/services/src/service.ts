/* eslint-disable max-len */
import { FetchBaseQueryMeta, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                                           from 'lodash'
import { Params }                                  from 'react-router-dom'
import { v4 as uuidv4 }                            from 'uuid'

import {
  CommonUrlsInfo,
  DHCPUrls,
  TableResult,
  Service,
  CommonResult,
  MdnsProxyFormData,
  MdnsProxyUrls,
  DHCPSaveData,
  LeaseUnit,
  WifiCallingUrls,
  WifiCallingFormContextType,
  WifiCallingSetting,
  DpskSaveData,
  DpskUrls,
  Portal,
  PortalUrlsInfo,
  NewTableResult,
  NewDpskPassphrase,
  transferToTableResult,
  DpskPassphrasesSaveData,
  convertMdnsProxyFormDataToApiPayload,
  MdnsProxyGetApiResponse,
  convertApiPayloadToMdnsProxyFormData,
  onSocketActivityChanged,
  onActivityMessageReceived,
  MdnsProxyAp,
  UploadUrlResponse,
  TableChangePayload,
  RequestFormData,
  createNewTableHttpRequest,
  downloadFile,
  NewAPITableResult,
  transferNewResToTableResult,
  MdnsProxyViewModel,
  PortalTablePayload,
  IpUtilsService,
  DpskPassphraseClient,
  DPSKDeviceInfo,
  AccessControlUrls,
  DpskMutationResult,
  DpskDownloadNewFlowPassphrasesPayload,
  DpskDownloadPassphrasesPayload,
  DpskPassphrasesClientPayload,
  DpskNewFlowPassphraseClient,
  ApplicationPolicy,
  DHCP_LIMIT_NUMBER,
  ApiVersionEnum,
  GetApiVersionHeader,
  convertMdnsProxyViewModelToMdnsProxyFormData,
  APExtended,
  CommonRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { baseServiceApi }                       from '@acx-ui/store'
import { RequestPayload }                       from '@acx-ui/types'
import { ApiInfo, batchApi, createHttpRequest } from '@acx-ui/utils'

import {
  commonQueryFn,
  getDhcpProfileFn,
  createWifiCallingFn,
  getWifiCallingFn,
  queryWifiCallingFn,
  updateWifiCallingFn,
  addDpskWithIdentityGroupFn
} from './servicePolicy.utils'
import { addDpskFn, updateDpskFn } from './servicePolicy.utils'

const defaultNewTablePaginationParams: TableChangePayload = {
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 10000
}

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const mDnsProxyMutationUseCases = [
  'AddMulticastDnsProxyServiceProfile',
  'DeleteMulticastDnsProxyServiceProfile',
  'DeleteMulticastDnsProxyServiceProfiles',
  'UpdateMulticastDnsProxyServiceProfile',
  'ActivateMulticastDnsProxyServiceProfileAps',
  'DeactivateMulticastDnsProxyServiceProfileAps',
  'ActivateMulticastDnsProxyProfile',
  'DeactivateMulticastDnsProxyProfile'
]

const defaultDpskVersioningHeaders = {
  'Content-Type': 'application/vnd.ruckus.v2+json',
  'Accept': 'application/vnd.ruckus.v2+json'
}

export const serviceApi = baseServiceApi.injectEndpoints({
  endpoints: (build) => ({
    applicationPolicyList: build.query<ApplicationPolicy[], RequestPayload>({
      query: ({ params }) => {
        const applicationPolicyListReq = createHttpRequest(
          AccessControlUrls.getAppPolicyList,
          params
        )
        return {
          ...applicationPolicyListReq
        }
      }
    }),
    getDHCPProfileList: build.query<DHCPSaveData[], RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.queryDhcpProfiles : DHCPUrls.getDHCPProfiles
        const req = createHttpRequest(url, params)
        const resolvedPayload = enableRbac
          ? { body: JSON.stringify({ ...(payload as {} ?? {}), pageSize: DHCP_LIMIT_NUMBER }) }
          : {}
        return {
          ...req,
          ...resolvedPayload
        }
      },
      transformResponse: (response: DHCPSaveData[] | TableResult<DHCPSaveData>, _meta, arg: RequestPayload) => {
        if(arg.enableRbac) {
          return (response as TableResult<DHCPSaveData>).data.map((item) => ({ ...item, serviceName: item.name || '' }))
        }
        return response as DHCPSaveData[]
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'DHCP', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddDhcpConfigServiceProfile',
            'UpdateDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'DHCP', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getDHCPProfileListViewModel: build.query<TableResult<DHCPSaveData>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.queryDhcpProfiles : DHCPUrls.getDHCPProfilesViewModel
        const req = createHttpRequest(url, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'DHCP', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddDhcpConfigServiceProfile',
            'UpdateDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfile',
            'DeleteDhcpConfigServiceProfiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'DHCP', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDHCPProfile: build.query<DHCPSaveData | null, RequestPayload>({
      queryFn: getDhcpProfileFn(),
      providesTags: [{ type: 'Service', id: 'DETAIL' }, { type: 'DHCP', id: 'DETAIL' }]
    }),
    saveOrUpdateDHCP: build.mutation<DHCPSaveData, RequestPayload>({
      query: ({ params, payload, enableRbac } :
        { params:Params, payload:DHCPSaveData, enableRbac: boolean }) => {
        const addDHCPUrl = enableRbac ? DHCPUrls.addDhcpServiceRbac : DHCPUrls.addDHCPService
        const updatedDHCPUrl = enableRbac ? DHCPUrls.updateDhcpServiceRbac : DHCPUrls.updateDHCPService
        const url = _.isEmpty(params.serviceId) ? addDHCPUrl : updatedDHCPUrl
        const dhcpReq = createHttpRequest(url, params)
        return {
          ...dhcpReq,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'DHCP', id: 'LIST' }]
    }),
    deleteDHCPService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? DHCPUrls.deleteDhcpProfileRbac : DHCPUrls.deleteDHCPProfile
        const req = createHttpRequest(url, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getMdnsProxy: build.query<MdnsProxyFormData, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.queryMdnsProxy : MdnsProxyUrls.getMdnsProxy
        const req = createHttpRequest(apiInfo, params)

        if (enableRbac) {
          const payload = {
            fields: ['id', 'name', 'rules', 'activations'],
            page: 1,
            pageSize: 10,
            filters: { id: [params?.serviceId] }
          }

          const res = await fetchWithBQ({ ...req, body: JSON.stringify(payload) })

          if (res.error) {
            return { error: res.error as FetchBaseQueryError }
          }
          const response = (res.data as TableResult<MdnsProxyViewModel>).data

          return (response && response.length > 0)
            ? { data: convertMdnsProxyViewModelToMdnsProxyFormData(response[0] as MdnsProxyViewModel) }
            : { error: { status: 404, data: 'Not found' } as FetchBaseQueryError }
        } else {
          const res = await fetchWithBQ({ ...req })
          return res.data
            ? { data: convertApiPayloadToMdnsProxyFormData(res.data as MdnsProxyGetApiResponse) }
            : { error: res.error as FetchBaseQueryError }
        }
      },
      providesTags: [{ type: 'MdnsProxy', id: 'DETAIL' }]
    }),
    getMdnsProxyList: build.query<MdnsProxyFormData[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.queryMdnsProxy : MdnsProxyUrls.getMdnsProxyList
        const req = createHttpRequest(apiInfo, params)
        const queryPayload = {
          fields: [ 'id','name', 'rules', 'activations'],
          page: 1,
          pageSize: 1000
        }
        return {
          ...req,
          body: enableRbac ? JSON.stringify(queryPayload) : undefined
        }
      },
      transformResponse (response: MdnsProxyGetApiResponse[] | TableResult<MdnsProxyViewModel>, _meta, arg) {
        if (arg.enableRbac) {
          const data = (response as TableResult<MdnsProxyViewModel>).data
          return data.map(result => convertMdnsProxyViewModelToMdnsProxyFormData(result))
        } else {
          const data = response as MdnsProxyGetApiResponse[]
          return data.map(result => convertApiPayloadToMdnsProxyFormData(result))
        }
      },
      providesTags: [{ type: 'MdnsProxy', id: 'LIST' }, { type: 'Service', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, mDnsProxyMutationUseCases, () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'MdnsProxy', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getEnhancedMdnsProxyList: build.query<TableResult<MdnsProxyViewModel>, RequestPayload>({
      query: commonQueryFn(MdnsProxyUrls.getEnhancedMdnsProxyList, MdnsProxyUrls.queryMdnsProxy),
      transformResponse: (result: TableResult<MdnsProxyViewModel>, _meta, arg) => {
        return arg.enableRbac
          ? {
            ...result,
            data: result.data?.map(profile => ({
              ...profile,
              venueIds: profile.activations?.map(activation => activation.venueId) ?? []
            }))
          }
          : result
      },
      providesTags: [{ type: 'MdnsProxy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, mDnsProxyMutationUseCases, () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'MdnsProxy', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateMdnsProxy: build.mutation<CommonResult, RequestPayload<MdnsProxyFormData>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.updateMdnsProxyRbac : MdnsProxyUrls.updateMdnsProxy
        const req = createHttpRequest(apiInfo, params)
        const res = await fetchWithBQ({
          ...req,
          body: JSON.stringify(convertMdnsProxyFormDataToApiPayload(payload as MdnsProxyFormData))
        })

        if (res.error) {
          return { error: res.error as FetchBaseQueryError }
        }

        if (enableRbac) {
          const activateApiInfo = MdnsProxyUrls.addMdnsProxyApsRbac
          const deactivateApiInfo = MdnsProxyUrls.deleteMdnsProxyApsRbac

          const oldScope = payload?.oldScope?.flatMap(s =>
            s.aps.map(ap => (s.venueId + '/' + ap.serialNumber))
          )
          const newScope = payload?.scope?.flatMap(s =>
            s.aps.map(ap => (s.venueId + '/' + ap.serialNumber))
          )

          const activateRequests = (newScope || [])
            .filter(s => !oldScope?.includes(s))
            .map(scope => {
              const pair = scope.split('/')
              return { params: { ...params, venueId: pair[0], apSerialNumber: pair[1] } }
            })
          const deactivateRequests = (oldScope || [])
            .filter(s => !newScope?.includes(s))
            .map(scope => {
              const pair = scope.split('/')
              return { params: { ...params, venueId: pair[0], apSerialNumber: pair[1] } }
            })

          await Promise.all([
            batchApi(activateApiInfo, activateRequests, fetchWithBQ),
            batchApi(deactivateApiInfo, deactivateRequests, fetchWithBQ)
          ])
        }

        return { data: res.data as CommonResult }
      },
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }]
    }),
    deleteMdnsProxy: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(MdnsProxyUrls.deleteMdnsProxy, MdnsProxyUrls.deleteMdnsProxyRbac),
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }]
    }),
    deleteMdnsProxyList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MdnsProxyUrls.deleteMdnsProxyList, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }, { type: 'Service', id: 'LIST' }]
    }),
    addMdnsProxy: build.mutation<CommonResult, RequestPayload<MdnsProxyFormData>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.addMdnsProxyRbac : MdnsProxyUrls.addMdnsProxy
        const req = createHttpRequest(apiInfo, params)
        const res = await fetchWithBQ({
          ...req,
          body: JSON.stringify(convertMdnsProxyFormDataToApiPayload(payload as MdnsProxyFormData))
        })

        if (res.error) {
          return { error: res.error as FetchBaseQueryError }
        }

        if (enableRbac) {
          const { response } = res.data as CommonResult
          const activateApiInfo = MdnsProxyUrls.addMdnsProxyApsRbac
          const serviceId = response?.id

          if (serviceId) {
            const requests: { params: Params<string> }[] = []

            payload?.scope?.forEach(scope => {
              const venueId = scope.venueId
              scope.aps.forEach(ap => {
                requests.push({
                  params: { serviceId, venueId, apSerialNumber: ap.serialNumber }
                })
              })
            })

            await batchApi(activateApiInfo, requests, fetchWithBQ)
          }
        }

        return { data: res.data as CommonResult }
      },
      invalidatesTags: [{ type: 'MdnsProxy', id: 'LIST' }]
    }),
    addMdnsProxyAps: build.mutation<CommonResult, RequestPayload<string[]>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.addMdnsProxyApsRbac : MdnsProxyUrls.addMdnsProxyAps

        if (enableRbac) {
          const requests = payload?.map(apSerialNumber => ({ params: { ...params, apSerialNumber } })) ?? []
          await batchApi(apiInfo, requests, fetchWithBQ)

          return { data: {} as CommonResult }
        } else {
          const res = await fetchWithBQ({
            ...createHttpRequest(apiInfo, params),
            body: payload
          })

          return res.data
            ? { data: res.data as CommonResult }
            : { error: res.error as FetchBaseQueryError }
        }
      },
      invalidatesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }]
    }),
    deleteMdnsProxyAps: build.mutation<CommonResult, RequestPayload<string[]>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.deleteMdnsProxyApsRbac : MdnsProxyUrls.deleteMdnsProxyAps

        if (enableRbac) {
          const requests = payload?.map(apSerialNumber => ({ params: { ...params, apSerialNumber } })) ?? []
          await batchApi(apiInfo, requests, fetchWithBQ)

          return { data: {} as CommonResult }
        } else {
          const res = await fetchWithBQ({
            ...createHttpRequest(apiInfo, params),
            body: payload
          })

          return res.data
            ? { data: res.data as CommonResult }
            : { error: res.error as FetchBaseQueryError }
        }
      },
      invalidatesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }]
    }),
    getMdnsProxyAps: build.query<TableResult<MdnsProxyAp>, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const apiInfo = enableRbac ? MdnsProxyUrls.queryMdnsProxy : MdnsProxyUrls.getMdnsProxyApsByVenue
        const req = createHttpRequest(apiInfo, params)
        const queryPayload = {
          fields: ['id', 'name', 'rules', 'activations'],
          page: 1,
          pageSize: 1000,
          filters: { venueIds: [params?.venueId] }
        }
        const res = await fetchWithBQ({ ...req, body: enableRbac ? JSON.stringify(queryPayload) : undefined })

        if (res.error) {
          return { error: res.error as FetchBaseQueryError }
        }

        if (enableRbac) {
          const queryApPayload = {
            fields: ['serialNumber', 'name', 'venueName'],
            page: 1,
            pageSize: 1000,
            ...(params?.venueIa ? {
              filters: {
                venueId: [params.venueId]
              }
            } : {})
          }
          const apReq = createHttpRequest(CommonRbacUrlsInfo.getApsList)
          const apResult = await fetchWithBQ({ ...apReq, body: JSON.stringify(queryApPayload) })
          const apMap = new Map<string, APExtended>()
          if (apResult.data) {
            const apData = apResult.data as TableResult<APExtended>
            apData.data.forEach(ap => apMap.set(ap.serialNumber, ap))
          }
          const result = (res.data ?? []) as TableResult<MdnsProxyViewModel>

          const mdnsProxyApList = result.data.flatMap(profile => {
            const activation = profile.activations?.find(a => a.venueId === params?.venueId)
            if (!activation) return []
            return activation.apSerialNumbers.map(serialNumber => {
              const ap = apMap.get(serialNumber)
              return {
                serialNumber,
                apName: ap?.name ?? serialNumber,
                venueId: params?.venueId,
                venueName: ap?.venueName ?? params?.venueId ?? '',
                serviceId: profile.id,
                serviceName: profile.name,
                rules: profile.rules
              } as MdnsProxyAp
            })
          })

          return {
            data: {
              data: mdnsProxyApList,
              page: 0,
              totalCount: mdnsProxyApList.length
            }
          }
        } else {
          const result = ((res.data ?? []) as MdnsProxyAp[])
            .map(data => {
              const rules = (data.rules ?? []).map((rule) => {
                return {
                  ...rule,
                  id: uuidv4(),
                  ruleIndex: uuidv4()
                }
              })

              return {
                ...data,
                rules
              }
            })

          return {
            data: {
              data: result,
              page: 0,
              totalCount: result.length
            }
          }
        }
      },
      providesTags: [{ type: 'MdnsProxyAp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    deleteWifiCallingServices: build.mutation<CommonResult, RequestPayload<string[]>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if (enableRbac) {
          const requests = payload?.map(serviceId => ({ params: { serviceId } })) ?? []
          await batchApi(WifiCallingUrls.deleteWifiCallingRbac, requests, fetchWithBQ)

          return { data: {} as CommonResult }
        } else {
          const res = await fetchWithBQ({
            ...createHttpRequest(WifiCallingUrls.deleteWifiCallingList, params),
            body: payload
          })

          return { data: res.data as CommonResult }
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    getWifiCallingService: build.query<WifiCallingFormContextType, RequestPayload>({
      queryFn: getWifiCallingFn(),
      providesTags: [{ type: 'Service', id: 'DETAIL' }, { type: 'WifiCalling', id: 'DETAIL' }]
    }),
    // eslint-disable-next-line max-len
    getEnhancedWifiCallingServiceList: build.query<TableResult<WifiCallingSetting>, RequestPayload>({
      queryFn: queryWifiCallingFn(),
      providesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddWifiCallingServiceProfile',
            'UpdateWifiCallingServiceProfile',
            'DeleteWifiCallingServiceProfile',
            'DeleteWifiCallingServiceProfiles',
            'ActivateWifiCallingServiceProfileOnWifiNetwork',
            'DeactivateWifiCallingServiceProfileOnWifiNetwork'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' },
              { type: 'WifiCalling', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    createWifiCallingService: build.mutation<CommonResult, RequestPayload<WifiCallingFormContextType>>({
      queryFn: createWifiCallingFn(),
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    updateWifiCallingService: build.mutation<CommonResult, RequestPayload<WifiCallingFormContextType>>({
      queryFn: updateWifiCallingFn(),
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'WifiCalling', id: 'LIST' }]
    }),
    activateWifiCallingService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WifiCallingUrls.activateWifiCalling, params)
      },
      invalidatesTags: [{ type: 'WifiCalling' }]
    }),
    deactivateWifiCallingService: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WifiCallingUrls.deactivateWifiCalling, params)
      },
      invalidatesTags: [{ type: 'WifiCalling' }]
    }),

    createDpsk: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      queryFn: addDpskFn(),
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    createDpskWithIdentityGroup: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      queryFn: addDpskWithIdentityGroupFn(),
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    updateDpsk: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      queryFn: updateDpskFn(),
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    getDpskList: build.query<TableResult<DpskSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskListReq = createNewTableHttpRequest({
          apiInfo: DpskUrls.getDpskList,
          params,
          payload: (payload as TableChangePayload) ?? defaultNewTablePaginationParams,
          headers: defaultDpskVersioningHeaders
        })

        return {
          ...getDpskListReq
        }
      },
      providesTags: [{ type: 'Dpsk', id: 'LIST' }],
      transformResponse (result: NewTableResult<DpskSaveData>) {
        return transferToTableResult<DpskSaveData>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UPDATE_DPSK_SERVICE',
            'DELETE_DPSK_SERVICE',
            'CREATE_DPSK_SERVICE'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Dpsk', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getEnhancedDpskList: build.query<TableResult<DpskSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskListReq = createDpskHttpRequest(DpskUrls.getEnhancedDpskList, params)

        return {
          ...getDpskListReq,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Dpsk', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UPDATE_DPSK_SERVICE',
            'DELETE_DPSK_SERVICE',
            'CREATE_DPSK_SERVICE'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Dpsk', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDpsk: build.query<DpskSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskReq = createDpskHttpRequest(DpskUrls.getDpsk, params)
        return {
          ...getDpskReq,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Dpsk', id: 'DETAIL' }]
    }),
    deleteDpsk: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.deleteDpsk, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Dpsk', id: 'LIST' }]
    }),
    createDpskPassphrases: build.mutation<CommonResult, RequestPayload<DpskPassphrasesSaveData>>({
      query: ({ params, payload }) => {
        const createDpskPassphrasesReq = createDpskHttpRequest(DpskUrls.addPassphrase, params)
        return {
          ...createDpskPassphrasesReq,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    updateDpskPassphrases: build.mutation<CommonResult, RequestPayload<DpskPassphrasesSaveData>>({
      query: ({ params, payload }) => {
        const createDpskPassphrasesReq = createDpskHttpRequest(DpskUrls.updatePassphrase, params)
        return {
          ...createDpskPassphrasesReq,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'DpskPassphrase', id: 'LIST' },
        { type: 'DpskPassphrase', id: 'DETAIL' }
      ]
    }),
    getEnhancedDpskPassphraseList: build.query<TableResult<NewDpskPassphrase>, RequestPayload>({
      query: ({ params, payload }) => {
        const getDpskListReq = createDpskHttpRequest(DpskUrls.getEnhancedPassphraseList, params)

        return {
          ...getDpskListReq,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'DpskPassphrase', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_DPSK_PASSPHRASE',
            'CREATE_DPSK_PASSPHRASES',
            'UPDATE_DPSK_PASSPHRASE',
            'BULK_CREATE_PERSONAS',
            'DELETE_DPSK_PASSPHRASE',
            'UPDATE_DPSK_PASSPHRASES',
            'IMPORT_DPSK_PASSPHRASES',
            'CREATE_PASSPHRASE_DEVICES',
            'DELETE_PASSPHRASE_DEVICES',
            'UpdatePersona' // for Identity details page > Block
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'DpskPassphrase', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getDpskPassphrase: build.query<NewDpskPassphrase, RequestPayload>({
      query: ({ params }) => {
        const req = createDpskHttpRequest(DpskUrls.getPassphrase, params)

        return {
          ...req
        }
      },
      providesTags: [{ type: 'DpskPassphrase', id: 'DETAIL' }]
    }),
    deleteDpskPassphraseList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.deletePassphrase, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    revokeDpskPassphraseList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.revokePassphrases, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }, { type: 'DpskPassphrase', id: 'DETAIL' }]
    }),
    getDpskPassphraseDevices: build.query<DPSKDeviceInfo[], RequestPayload>({
      query: ({ params }) => {
        const req = createDpskHttpRequest(DpskUrls.getPassphraseDevices, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'DpskPassphraseDevices', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_PASSPHRASE_DEVICES',
            'DELETE_PASSPHRASE_DEVICES',
            'CREATE_DPSK_PASSPHRASE',
            'CREATE_DPSK_PASSPHRASES',
            'UPDATE_DPSK_PASSPHRASE',
            'DELETE_DPSK_PASSPHRASE',
            'UPDATE_DPSK_PASSPHRASES',
            'IMPORT_DPSK_PASSPHRASES'
          ], () => {
            // eslint-disable-next-line max-len
            api.dispatch(serviceApi.util.invalidateTags( [{ type: 'DpskPassphraseDevices', id: 'LIST' }]))
          })
        })
      }
    }),
    updateDpskPassphraseDevices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.updatePassphraseDevices, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'DpskPassphraseDevices', id: 'LIST' }]
    }),
    deleteDpskPassphraseDevices: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(DpskUrls.deletePassphraseDevices, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'DpskPassphraseDevices', id: 'LIST' }]
    }),
    uploadPassphrases: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(DpskUrls.uploadPassphrases, params, {
          'Content-Type': undefined
        })

        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'DpskPassphrase', id: 'LIST' }]
    }),
    downloadPassphrases: build.mutation<Blob, RequestPayload<DpskDownloadPassphrasesPayload>>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(
          DpskUrls.exportPassphrases,
          {
            ...params,
            timezone: payload?.timezone ?? 'UTC',
            dateFormat: payload?.dateFormat ?? 'dd/MM/yyyy HH:mm'
          }
        )

        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'DPSK_Passphrase.csv'
            downloadFile(response, fileName)
          },
          headers: {
            ...req.headers,
            Accept: 'text/csv'
          }
        }
      }
    }),
    // eslint-disable-next-line max-len
    downloadNewFlowPassphrases: build.query<Blob, RequestPayload<DpskDownloadNewFlowPassphrasesPayload>>({
      query: ({ params, payload }) => {
        const req = createDpskHttpRequest(
          DpskUrls.exportNewFlowPassphrases,
          {
            ...params,
            timezone: payload?.timezone ?? 'UTC',
            dateFormat: payload?.dateFormat ?? 'dd/MM/yyyy HH:mm'
          }
        )

        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'DPSK_Passphrase.csv'
            downloadFile(response, fileName)
          },
          headers: {
            ...req.headers,
            'Content-Type': 'application/json',
            'Accept': 'text/csv'
          }
        }
      }
    }),
    // eslint-disable-next-line max-len
    getPassphraseClient: build.query<DpskPassphraseClient | undefined, RequestPayload<DpskPassphrasesClientPayload>>({
      query: ({ params, payload }) => {
        const apiInfo = DpskUrls['getPassphraseClient']
        const apiParams = {
          ...params,
          networkId: payload!.networkId,
          mac: payload!.mac
        }

        const req = createDpskHttpRequest(apiInfo, apiParams)

        return {
          ...req
        }
      },
      transformResponse (result: DpskNewFlowPassphraseClient | DpskPassphraseClient) {
        if (_.isEmpty(result)) return {} as DpskPassphraseClient

        const res = result as DpskNewFlowPassphraseClient

        return {
          passphraseId: res.id,
          username: res.username,
          passphrase: res.passphrase,
          numberOfDevices: res.numberOfDevices,
          clientMac: res.devices?.map(device => device.mac) ?? [],
          createdDate: res.createdDate,
          expirationDate: res.expirationDate
        } as DpskPassphraseClient
      }
    }),
    getPortal: build.query<Portal, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const apiVersion = enableRbac? ApiVersionEnum.v1_1 : ApiVersionEnum.v1
        const customHeaders = GetApiVersionHeader(apiVersion)

        const req = createHttpRequest(PortalUrlsInfo.getPortal,
          params,
          customHeaders)
        return { ...req }
      },
      providesTags: [{ type: 'Service', id: 'DETAIL' }]
    }),
    deletePortal: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PortalUrlsInfo.deletePortal,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
        return { ...req }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    updatePortal: build.mutation<Service, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const apiVersion = enableRbac? ApiVersionEnum.v1_1 : ApiVersionEnum.v1
        const customHeaders = GetApiVersionHeader(apiVersion)
        const req = createHttpRequest(PortalUrlsInfo.updatePortal,
          params,
          customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    createPortal: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const apiVersion = enableRbac? ApiVersionEnum.v1_1 : ApiVersionEnum.v1
        const customHeaders = GetApiVersionHeader(apiVersion)

        const req = createHttpRequest(
          PortalUrlsInfo.createPortal, params, customHeaders
        )
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Service', id: 'LIST' }]
    }),
    getEnhancedPortalProfileList: build.query<TableResult<Portal>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const apiVersion = enableRbac? ApiVersionEnum.v1_1 : ApiVersionEnum.v1
        const customHeaders = GetApiVersionHeader(apiVersion)
        const req = createHttpRequest(PortalUrlsInfo.getEnhancedPortalProfileList,
          params, customHeaders)
        const portalTablePayload = enableRbac ?
          _.omit(payload as PortalTablePayload, ['defaultPageSize', 'total']) :
          _.omit(payload as PortalTablePayload, ['defaultPageSize', 'total', 'fields'])
        return {
          ...req,
          body: JSON.stringify({ ...portalTablePayload })
        }
      },
      transformResponse (result: NewAPITableResult<Portal>|TableResult<Portal>) {
        if (result && 'data' in result && result.data) {
          return result as TableResult<Portal>
        }
        return transferNewResToTableResult<Portal>(result as NewAPITableResult<Portal>)
      },
      providesTags: [{ type: 'Service', id: 'LIST' },{ type: 'Portal', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Portal Service Profile',
            'Update Portal Service Profile',
            'Update Portal Service Profile V1_1',
            'Delete Portal Service Profile',
            'Delete Portal Service Profiles'
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([{ type: 'Portal', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getPortalLang: build.mutation<{ [key: string]: string }, RequestPayload>({
      query: ({ params }) => {
        const portalLang = createHttpRequest(PortalUrlsInfo.getPortalLang, params)
        return {
          ...portalLang
        }
      }
    }),
    activatePortal: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          PortalUrlsInfo.activatePortal,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadPhoto: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PortalUrlsInfo.uploadPhoto,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadLogo: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PortalUrlsInfo.uploadLogo,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadBgImage: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PortalUrlsInfo.uploadBgImage,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadPoweredImg: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PortalUrlsInfo.uploadPoweredImg,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadURL: build.mutation<UploadUrlResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const createUploadReq = createHttpRequest(CommonUrlsInfo.getUploadURL, params, RKS_NEW_UI)
        return {
          ...createUploadReq,
          body: payload
        }
      }
    })
  })
})

export const {
  useApplicationPolicyListQuery,
  useGetDHCPProfileQuery,
  useLazyGetDHCPProfileQuery,
  useSaveOrUpdateDHCPMutation,
  useDeleteDHCPServiceMutation,
  useGetDHCPProfileListQuery,
  useLazyGetDHCPProfileListQuery,
  useGetMdnsProxyQuery,
  useLazyGetMdnsProxyListQuery,
  useGetMdnsProxyListQuery,
  useGetEnhancedMdnsProxyListQuery,
  useAddMdnsProxyMutation,
  useUpdateMdnsProxyMutation,
  useDeleteMdnsProxyMutation,
  // useDeleteMdnsProxyListMutation, no use and no support for RBAC
  useAddMdnsProxyApsMutation,
  useDeleteMdnsProxyApsMutation,
  useGetMdnsProxyApsQuery,
  useDeleteWifiCallingServicesMutation,
  useGetWifiCallingServiceQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useCreateWifiCallingServiceMutation,
  useUpdateWifiCallingServiceMutation,
  useActivateWifiCallingServiceMutation,
  useDeactivateWifiCallingServiceMutation,
  useCreateDpskMutation,
  useCreateDpskWithIdentityGroupMutation,
  useUpdateDpskMutation,
  useGetDpskQuery,
  useLazyGetDpskQuery,
  useGetDpskListQuery,
  useLazyGetDpskListQuery,
  useGetEnhancedDpskListQuery,
  useDeleteDpskMutation,
  useGetEnhancedDpskPassphraseListQuery,
  useLazyGetEnhancedDpskPassphraseListQuery,
  useGetDpskPassphraseQuery,
  useCreateDpskPassphrasesMutation,
  useUpdateDpskPassphrasesMutation,
  useDeleteDpskPassphraseListMutation,
  useRevokeDpskPassphraseListMutation,
  useGetDpskPassphraseDevicesQuery,
  useLazyGetDpskPassphraseDevicesQuery,
  useUpdateDpskPassphraseDevicesMutation,
  useDeleteDpskPassphraseDevicesMutation,
  useUploadPassphrasesMutation,
  useDownloadPassphrasesMutation,
  useLazyDownloadNewFlowPassphrasesQuery,
  useGetPassphraseClientQuery,
  useGetPortalQuery,
  useLazyGetPortalQuery,
  useGetEnhancedPortalProfileListQuery,
  useLazyGetEnhancedPortalProfileListQuery,
  useCreatePortalMutation,
  useGetPortalLangMutation,
  useDeletePortalMutation,
  useUpdatePortalMutation,
  useUploadBgImageMutation,
  useUploadLogoMutation,
  useActivatePortalMutation,
  useUploadPhotoMutation,
  useUploadPoweredImgMutation,
  useUploadURLMutation,
  useGetDHCPProfileListViewModelQuery,
  useLazyGetDHCPProfileListViewModelQuery
} = serviceApi

export function createDpskHttpRequest (
  apiInfo: ApiInfo,
  params?: Params<string>,
  customHeaders?: Record<string, unknown>,
  ignoreDelegation?: boolean
) {
  const defaultHeaders = {
    'Content-Type': 'application/vnd.ruckus.v2+json',
    'Accept': 'application/vnd.ruckus.v2+json'
  }

  return createHttpRequest(
    apiInfo,
    params,
    { ...defaultHeaders, ...customHeaders },
    ignoreDelegation
  )
}

// eslint-disable-next-line max-len
export function transformDhcpResponse (dhcpProfile: DHCPSaveData, _meta: FetchBaseQueryMeta, arg: RequestPayload) {
  _.each(dhcpProfile.dhcpPools, (pool)=>{
    if (arg.enableRbac && !pool.id) {
      pool.id = uuidv4()
    }
    if(pool.leaseTimeMinutes && pool.leaseTimeMinutes > 0){
      pool.leaseUnit = LeaseUnit.MINUTES
      pool.leaseTime = pool.leaseTimeMinutes + (pool.leaseTimeHours||0)*60
    }else{
      pool.leaseUnit = LeaseUnit.HOURS
      pool.leaseTime = pool.leaseTimeHours
    }

    // eslint-disable-next-line max-len
    pool.numberOfHosts = IpUtilsService.countIpRangeSize(pool.startIpAddress, pool.endIpAddress)
  })
  return dhcpProfile
}
