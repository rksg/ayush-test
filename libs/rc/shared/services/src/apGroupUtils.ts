import { FetchBaseQueryError }                       from '@reduxjs/toolkit/query'
import { omit, uniq, cloneDeep, forIn, pick, isNil } from 'lodash'

import {
  ApDeep,
  ApGroup,
  ApGroupViewModel,
  CountAndNames,
  FILTER,
  NewAPModel,
  NewApGroupViewModelResponseType,
  NewGetApGroupResponseType,
  TableResult,
  Venue,
  WifiNetwork,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  GetApiVersionHeader,
  ApiVersionEnum,
  CommonUrlsInfo,
  CommonRbacUrlsInfo,
  ApGroupConfigTemplateUrlsInfo,
  ConfigTemplateUrlsInfo,
  AddApGroup
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { QueryFn }           from './servicePolicy.utils'
import { isPayloadHasField } from './utils'


const apGroupOldNewFieldsMapping: Record<string, string> = {
  aps: 'apSerialNumbers',
  members: 'apSerialNumbers',
  networks: 'wifiNetworkIds',
  clients: 'clientCount'
}

export const getApGroupNewFieldFromOld = (oldFieldName: string) => {
  return apGroupOldNewFieldsMapping[oldFieldName] ?? oldFieldName
}

export const getNewApGroupViewmodelPayloadFromOld = (payload: Record<string, unknown>) => {
  const newPayload = cloneDeep(payload) as Record<string, unknown>

  if (newPayload.fields) {
    // eslint-disable-next-line max-len
    newPayload.fields = uniq((newPayload.fields as string[])?.map(field => getApGroupNewFieldFromOld(field)))
  }
  if (newPayload.searchTargetFields) {
  // eslint-disable-next-line max-len
    newPayload.searchTargetFields = uniq((newPayload.searchTargetFields as string[])?.map(field => getApGroupNewFieldFromOld(field)))
  }

  newPayload.sortField = getApGroupNewFieldFromOld(payload.sortField as string)

  if (payload.filters) {
    const filters = {} as FILTER
    forIn((payload.filters as FILTER), (val, key) => {
      filters[getApGroupNewFieldFromOld(key)] = val
    })
    newPayload.filters = filters
  }

  return newPayload
}

export const transformApGroupFromNewType = (newApGroup: NewGetApGroupResponseType,
  apsList: TableResult<NewAPModel>)=> {
  return {
    ...omit(newApGroup, ['apSerialNumbers']),
    aps: apsList.data
  } as unknown as ApGroup
}

export const aggregateApGroupVenueInfo = (
  apGroupList: TableResult<ApGroupViewModel>,
  venueList: TableResult<Venue>
) => {
  const venueListData = venueList.data
  apGroupList.data.forEach(apGroupItem => {
    apGroupItem.venueName = venueListData.find(venueItem =>
      venueItem.id === apGroupItem.venueId)?.name
  })
}

export const aggregateApGroupNetworkInfo = (
  apGroupList: TableResult<ApGroupViewModel>,
  rbacApGroupList: TableResult<NewApGroupViewModelResponseType>,
  networks: TableResult<WifiNetwork>
) => {
  apGroupList.data.forEach(apGroupItem => {
    const groupItem = rbacApGroupList.data.find(item => item.id === apGroupItem.id)
    apGroupItem.networks = {
      count: groupItem?.wifiNetworkIds?.length ?? 0,
      names: groupItem?.wifiNetworkIds?.map((id) => {
        return networks.data?.find(n => n.id === id)?.name
      }).filter(i => !!i) ?? []
    } as CountAndNames
  })
}

export const aggregateApGroupApInfo = (
  apGroupList: TableResult<ApGroupViewModel>,
  rbacApGroupList: TableResult<NewApGroupViewModelResponseType>,
  apList: TableResult<NewAPModel>
) => {
  apGroupList.data.forEach(apGroupItem => {
    const groupItem = rbacApGroupList.data.find(item => item.id === apGroupItem.id)
    apGroupItem.aps = groupItem?.apSerialNumbers?.map((apSerialNumber) => ({
      serialNumber: apSerialNumber,
      name: apList.data?.find(n => n.serialNumber === apSerialNumber)?.name
    }) as ApDeep)
    apGroupItem.members = {
      count: groupItem?.apSerialNumbers?.length ?? 0,
      names: groupItem?.apSerialNumbers?.map((apSerialNumber) => {
        return apList.data
          ?.find(n => n.serialNumber === apSerialNumber)?.name
      }).filter(i => !!i) ?? []
    } as CountAndNames
  })
}

// eslint-disable-next-line max-len
export const getApGroupsListFn = (isTemplate: boolean = false) : QueryFn<TableResult<ApGroupViewModel>, RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
    const apis = isTemplate ? ApGroupConfigTemplateUrlsInfo : urlsInfo
    const apGroupListReq = createHttpRequest(
      isTemplate && enableRbac ? apis.getApGroupsListRbac : apis.getApGroupsList,
      params
    )

    let apGroups: TableResult<ApGroupViewModel>
    if (enableRbac) {
      const newPayload = getNewApGroupViewmodelPayloadFromOld(payload as Record<string, unknown>)
      const apGroupListQuery = await fetchWithBQ({
        ...apGroupListReq,
        body: JSON.stringify(newPayload)
      })

      // simplely map new fields into old fields
      const rbacApGroups = apGroupListQuery.data as TableResult<NewApGroupViewModelResponseType>
      apGroups = {
        ...omit(rbacApGroups, ['data']),
        data: [] as ApGroupViewModel[]
      } as TableResult<ApGroupViewModel>

      rbacApGroups.data.forEach(group => {
        apGroups.data.push({
          ...pick(group, ['id', 'name', 'venueId', 'isDefault']),
          clients: group.clientCount
        } as ApGroupViewModel)
      })

      const defaultIdNamePayload = {
        fields: ['name', 'id'],
        pageSize: 10000
      }

      // fetch venue name
      const venueIds = uniq(rbacApGroups.data.map(item => item.venueId))
      if (venueIds.length && isPayloadHasField(payload, 'venueName')) {
        const venueListQuery = await fetchWithBQ({
          // eslint-disable-next-line max-len
          ...createHttpRequest(isTemplate ? ConfigTemplateUrlsInfo.getVenuesTemplateList : CommonUrlsInfo.getVenuesList),
          body: { ...defaultIdNamePayload, filters: { id: venueIds } }
        })
        const venueList = venueListQuery.data as unknown as TableResult<Venue>
        aggregateApGroupVenueInfo(apGroups, venueList)
      }

      // fetch networks name
      // eslint-disable-next-line max-len
      const networkIds = uniq(rbacApGroups.data.flatMap(item => item[getApGroupNewFieldFromOld('networks') as keyof typeof item]))
      if (networkIds.length && isPayloadHasField(payload, 'networks')) {
        // eslint-disable-next-line max-len
        const networkListReq = createHttpRequest(
          // eslint-disable-next-line max-len
          isTemplate ? ConfigTemplateUrlsInfo.getNetworkTemplateListRbac : CommonUrlsInfo.getWifiNetworksList,
          params)
        const networkListQuery = await fetchWithBQ({
          ...networkListReq,
          body: JSON.stringify({ ...defaultIdNamePayload, filters: { id: networkIds } })
        })
        const networks = networkListQuery.data as unknown as TableResult<WifiNetwork>
        aggregateApGroupNetworkInfo(apGroups, rbacApGroups, networks)
      }

      // fetch aps name
      const apIds = uniq(rbacApGroups.data
        .flatMap(item => item[getApGroupNewFieldFromOld('members') as keyof typeof item])
        .filter(i => !isNil(i)))

      if (!isTemplate && apIds.length && isPayloadHasField(payload, ['members', 'aps'])) {
        const apQueryPayload = {
          fields: ['name', 'serialNumber'],
          pageSize: 10000,
          filters: { serialNumber: apIds }
        }
        const apsListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonRbacUrlsInfo.getApsList, params),
          body: JSON.stringify(apQueryPayload)
        })
        const aps = apsListQuery.data as unknown as TableResult<NewAPModel>
        aggregateApGroupApInfo(apGroups, rbacApGroups, aps)
      }
    } else {
      const apGroupListQuery = await fetchWithBQ({
        ...apGroupListReq,
        body: JSON.stringify(payload)
      })
      apGroups = apGroupListQuery.data as TableResult<ApGroupViewModel>
    }

    return { data: apGroups }
  }
}

// eslint-disable-next-line max-len
export const getApGroupFn = (isTemplate: boolean = false) : QueryFn<ApGroup, RequestPayload> => {
  return async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
    const apis = isTemplate ? ApGroupConfigTemplateUrlsInfo : urlsInfo
    // eslint-disable-next-line max-len
    const apGroupQuery = await fetchWithBQ(createHttpRequest(
      isTemplate && enableRbac ? apis.getApGroupRbac : apis.getApGroup,
      params
    ))

    let apGroup: ApGroup
    if (enableRbac) {
      const newApGroupData = apGroupQuery.data as unknown as NewGetApGroupResponseType
      let rbacAps: TableResult<NewAPModel> = {
        data: [],
        totalCount: 0,
        page: 1
      }
      if (newApGroupData.apSerialNumbers?.length) {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const apListQuery = await fetchWithBQ({
          ...createHttpRequest(CommonRbacUrlsInfo.getApsList, params, customHeaders),
          body: JSON.stringify({
            fields: ['serialNumber', 'name'],
            filters: { serialNumber: newApGroupData.apSerialNumbers },
            pageSize: 10000,
            sortField: 'name',
            sortOrder: 'ASC'
          })
        })

        rbacAps = apListQuery.data as unknown as TableResult<NewAPModel>
      }

      apGroup = transformApGroupFromNewType(newApGroupData, rbacAps)
      apGroup.venueId = params!.venueId as string
    } else {
      apGroup = apGroupQuery.data as ApGroup
    }

    return { data: apGroup }
  }
}

// eslint-disable-next-line max-len
export const updateApGroupFn = (isTemplate: boolean = false) : QueryFn<AddApGroup, RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
      const apis = isTemplate ? ApGroupConfigTemplateUrlsInfo : urlsInfo
      const req = createHttpRequest(
        isTemplate && enableRbac ? apis.updateApGroupRbac : apis.updateApGroup,
        params
      )

      let newPayload: AddApGroup = { ...(payload as unknown as AddApGroup) }
      // transform payload
      if (enableRbac) {
        newPayload.apSerialNumbers = newPayload.apSerialNumbers
          ?.map(i => (i as { serialNumber: string }).serialNumber) ?? []
      }

      const res = await fetchWithBQ({
        ...req,
        body: JSON.stringify(newPayload)
      })
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      } else {
        return { data: res.data as AddApGroup }
      }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

// eslint-disable-next-line max-len
export const addApGroupFn = (isTemplate: boolean = false) : QueryFn<AddApGroup, RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const urlsInfo = enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
      const apis = isTemplate ? ApGroupConfigTemplateUrlsInfo : urlsInfo
      const req = createHttpRequest(apis.addApGroup, params)

      let newPayload: AddApGroup = { ...(payload as unknown as AddApGroup) }
      // transform payload
      if (enableRbac) {
        newPayload.apSerialNumbers = newPayload.apSerialNumbers
          ?.map(i => (i as { serialNumber: string }).serialNumber) ?? []
      }

      const res = await fetchWithBQ({
        ...req,
        body: JSON.stringify(newPayload)
      })
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      } else {
        return { data: res.data as AddApGroup }
      }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

export const deleteApGroupsTemplateFn = () : QueryFn<ApGroup[], RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const apis = ApGroupConfigTemplateUrlsInfo
      const apGroupListReq = createHttpRequest(
        enableRbac ? apis.getApGroupsListRbac : apis.getApGroupsList, params)
      let apGroups: TableResult<ApGroupViewModel>

      if (enableRbac) {
        const apGroupInfoPayload = {
          searchString: '',
          fields: [ 'id', 'venueId'],
          filters: { id: [params?.templateId] },
          pageSize: 1
        }
        // eslint-disable-next-line max-len
        const newPayload = getNewApGroupViewmodelPayloadFromOld(apGroupInfoPayload as Record<string, unknown>)
        const apGroupListQuery = await fetchWithBQ({
          ...apGroupListReq,
          body: JSON.stringify(newPayload)
        })

        // simplely map new fields into old fields
        // eslint-disable-next-line max-len
        const rbacApGroups = apGroupListQuery.data as unknown as TableResult<NewApGroupViewModelResponseType>
        apGroups = {
          ...omit(rbacApGroups, ['data']),
          data: [] as ApGroupViewModel[]
        } as TableResult<ApGroupViewModel>

        rbacApGroups.data.forEach(group => {
          apGroups.data.push({
            ...pick(group, ['id', 'name', 'venueId', 'isDefault']),
            clients: group.clientCount
          } as ApGroupViewModel)
        })
      } else {
        const apGroupListQuery = await fetchWithBQ({
          ...apGroupListReq,
          body: JSON.stringify(payload)
        })
        apGroups = apGroupListQuery.data as unknown as TableResult<ApGroupViewModel>
      }

      const req = createHttpRequest(
        // eslint-disable-next-line max-len
        enableRbac ? ApGroupConfigTemplateUrlsInfo.deleteApGroupRbac : ApGroupConfigTemplateUrlsInfo.deleteApGroup,
        {
          ...params,
          venueId: apGroups.data?.[0]?.venueId
        }
      )

      const res = await fetchWithBQ({
        ...req
      })
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      } else {
        return { data: res.data as ApGroup[] }
      }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

