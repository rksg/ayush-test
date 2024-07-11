import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query/react'
import { MaybePromise }                            from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs }                               from '@reduxjs/toolkit/query'
import { Params }                                  from 'react-router-dom'

import {
  AccessControlUrls,
  ApiVersionEnum, ApplicationPolicy, appPolicyInfoType,
  CommonResult, DevicePolicy, devicePolicyInfoType, EnhancedAccessControlInfoType,
  GetApiVersionHeader, L2AclPolicy, l2AclPolicyInfoType, L3AclPolicy, l3AclPolicyInfoType,
  TableResult
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { QueryFn } from './common'


type FetchData<T> = {
  data: T
}

export interface ComparisonObjectType {
  added: ActionItem[]
  removed: ActionItem[]
  updated: UpdateActionItem[]
}

export interface ActionMapType {
  [key: string]: {
    added: (params: Params<string>) => FetchArgs
    removed: (params: Params<string>) => FetchArgs
    updated: (params: Params<string>, oldParams: Params<string>) => FetchArgs[]
  }
}

export interface WifiActionMapType {
  [key: string]: {
    added: (params: Params<string>) => Promise<CommonResult>
    removed: (params: Params<string>) => Promise<CommonResult>
    updated: (params: Params<string>, oldParams: Params<string>) => Promise<CommonResult>[]
  }
}

export interface ActionItem {
  [key: string]: Params<string>
}

export interface UpdateActionItem {
  [key: string]: {
    oldAction: Params<string>,
    action: Params<string>
  }
}

export async function fetchAdditionalData<T, U> (
  fetchData: TableResult<T>,
  processFn: (data: T) => Promise<U>
): Promise<FetchData<TableResult<U>>> {
  const withAdditionalData = await Promise.all(
    fetchData.data.map(processFn)
  )

  return {
    data: {
      ...fetchData,
      data: withAdditionalData
    }
  }
}

export function comparePayload (
  currentPayload: Record<string, unknown>,
  oldPayload: Record<string, unknown>,
  id: string,
  // eslint-disable-next-line max-len
  itemProcessFn: (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown>, key: string, id: string) => ActionItem | UpdateActionItem
) {
  const comparisonObject = {
    added: [],
    removed: [],
    updated: []
  } as ComparisonObjectType

  for (const key in currentPayload) {
    if (!oldPayload[key]) {
      comparisonObject.added.push(itemProcessFn(currentPayload, {}, key, id) as ActionItem)
    } else {
      if (JSON.stringify(currentPayload[key]) !== JSON.stringify(oldPayload[key])) {
        comparisonObject.updated.push(
          itemProcessFn(currentPayload, oldPayload, key, id) as UpdateActionItem
        )
      }
    }
  }

  for (const key in oldPayload) {
    if (!currentPayload[key]) {
      comparisonObject.removed.push(itemProcessFn(oldPayload, {}, key, id) as ActionItem)
    }
  }

  return comparisonObject
}

export const accessControlActionMap = {
  l2AclPolicyId: {
    added: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.activateL2AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    removed: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.deactivateL2AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    updated: (oldParams: Params<string>, params: Params<string>) => {
      return [
        createHttpRequest(
          AccessControlUrls.deactivateL2AclOnAccessControlProfile,
          oldParams,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ),
        createHttpRequest(
          AccessControlUrls.activateL2AclOnAccessControlProfile,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        )
      ]
    }
  },
  l3AclPolicyId: {
    added: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.activateL3AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    removed: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.deactivateL3AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    updated: (oldParams: Params<string>, params: Params<string>) => {
      return [
        createHttpRequest(
          AccessControlUrls.deactivateL3AclOnAccessControlProfile,
          oldParams,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ),
        createHttpRequest(
          AccessControlUrls.activateL3AclOnAccessControlProfile,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        )
      ]
    }
  },
  devicePolicyId: {
    added: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.activateDevicePolicyOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    removed: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.deactivateDevicePolicyOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    updated: (oldParams: Params<string>, params: Params<string>) => {
      return [
        createHttpRequest(
          AccessControlUrls.deactivateDevicePolicyOnAccessControlProfile,
          oldParams,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ),
        createHttpRequest(
          AccessControlUrls.activateDevicePolicyOnAccessControlProfile,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        )
      ]
    }
  },
  applicationPolicyId: {
    added: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.activateApplicationPolicyOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    removed: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.deactivateApplicationPolicyOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    updated: (oldParams: Params<string>, params: Params<string>) => {
      return [
        createHttpRequest(
          AccessControlUrls.deactivateApplicationPolicyOnAccessControlProfile,
          oldParams,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ),
        createHttpRequest(
          AccessControlUrls.activateApplicationPolicyOnAccessControlProfile,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        )
      ]
    }
  }
} as ActionMapType

export const operateAction = async (
  comparisonObject: ComparisonObjectType, actionMap: ActionMapType,
  fetchWithBQ:(arg: string | FetchArgs) => MaybePromise<
    QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
  enableRbac: boolean | undefined
) => {
  if (!enableRbac) return Promise.resolve()
  // eslint-disable-next-line max-len
  const removeActions: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
  for (const removedObject of comparisonObject.removed) {
    Object.entries(removedObject).forEach(([key, value]) => {
      if (key in actionMap) {
        removeActions.push(fetchWithBQ(actionMap[key].removed(value)))
      }
    })
  }
  await Promise.all(removeActions)
  // eslint-disable-next-line max-len
  const addActions: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
  for (const addedObject of comparisonObject.added) {
    Object.entries(addedObject).forEach(([key, value]) => {
      if (key in actionMap) {
        addActions.push(fetchWithBQ(actionMap[key].added(value)))
      }
    })
  }

  await Promise.all(addActions)
  // eslint-disable-next-line max-len
  const updateActions: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
  for(const updatedObject of comparisonObject.updated) {
    Object.entries(updatedObject).forEach(([key, value]) => {
      if (key in actionMap) {
        // eslint-disable-next-line max-len
        const updatedActionRequests = actionMap[key].updated(value.oldAction, value.action)
        for (const request of updatedActionRequests) {
          updateActions.push(fetchWithBQ(request))
        }
      }
    })
  }
  await Promise.all(updateActions)
}

// eslint-disable-next-line max-len
export function addAccessControlProfileFn () : QueryFn<CommonResult, RequestPayload> {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const addProfileQuery = {
        // eslint-disable-next-line max-len
        ...createHttpRequest(enableRbac ? AccessControlUrls.addAccessControlProfileRbac : AccessControlUrls.addAccessControlProfile, params),
        body: enableRbac ? JSON.stringify(payload) : payload
      }
      const addProfileQueryRes = await fetchWithBQ(addProfileQuery)
      const profileData = addProfileQueryRes.data as CommonResult

      // eslint-disable-next-line max-len
      const itemProcessFn = (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown> | null, key: string, id: string) => {
        const keyObject = currentPayload[key] as { id: string }
        const idName = `${key}Id`
        return {
          [idName]: { policyId: id, [idName]: keyObject.id }
        } as ActionItem
      }

      const comparisonResult = comparePayload(
        payload as Record<string, unknown>,
        {},
        profileData.response?.id as string,
        itemProcessFn
      )

      await operateAction(comparisonResult, accessControlActionMap, fetchWithBQ, enableRbac)

      if (addProfileQueryRes.error) {
        return { error: addProfileQueryRes.error as FetchBaseQueryError }
      }

      return { data: addProfileQueryRes.data as CommonResult }

    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

// eslint-disable-next-line max-len
export function updateAccessControlProfileFn () : QueryFn<CommonResult, RequestPayload> {
  // eslint-disable-next-line max-len
  return async ({ params, payload, enableRbac, oldPayload }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const updateProfileQuery = {
        // eslint-disable-next-line max-len
        ...createHttpRequest(enableRbac ? AccessControlUrls.updateAccessControlProfileRbac : AccessControlUrls.updateAccessControlProfile, params),
        body: enableRbac ? JSON.stringify(payload) : payload
      }

      const updateProfileQueryRes = await fetchWithBQ(updateProfileQuery)

      // eslint-disable-next-line max-len
      const itemProcessFn = (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown>, key: string, id: string) => {
        const idName = `${key}Id`

        if (!Object.keys(oldPayload).length) {
          const keyObject = currentPayload[key] as { id: string }
          return {
            [idName]: { policyId: id, [idName]: keyObject.id }
          } as ActionItem
        }

        const oldObject = oldPayload[key] as { id: string }
        const updateObject = currentPayload[key] as { id: string }
        return {
          [idName]: {
            oldAction: { policyId: id, [idName]: oldObject.id },
            action: { policyId: id, [idName]: updateObject.id }
          }
        } as UpdateActionItem
      }

      const comparisonResult = comparePayload(
        payload as Record<string, unknown>,
        oldPayload as Record<string, unknown>,
        (payload as Record<string, unknown>).id as string,
        itemProcessFn
      )

      await operateAction(comparisonResult, accessControlActionMap, fetchWithBQ, enableRbac)

      if (updateProfileQueryRes.error) {
        return { error: updateProfileQueryRes.error as FetchBaseQueryError }
      }

      return { data: updateProfileQueryRes.data as CommonResult }

    } catch(error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

// eslint-disable-next-line max-len
export function getEnhancedAccessControlProfileListFn () : QueryFn<TableResult<EnhancedAccessControlInfoType>, RequestPayload> {
  // eslint-disable-next-line max-len
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const aclPolicyListInfo = {
      // eslint-disable-next-line max-len
      ...createHttpRequest(enableRbac ? AccessControlUrls.getAccessControlProfileQueryList : AccessControlUrls.getEnhancedAccessControlProfiles, params),
      body: enableRbac ? JSON.stringify(payload) : payload
    }

    const aclPolicyListInfoQuery = await fetchWithBQ(aclPolicyListInfo)
    const aclPolicyList = aclPolicyListInfoQuery.data as TableResult<EnhancedAccessControlInfoType>

    // fill in the mac addresses
    const processFn = async (policy: EnhancedAccessControlInfoType) => {
      if (!enableRbac) return policy

      try {
        const aclPolicyDetail = createHttpRequest(
          // eslint-disable-next-line max-len
          enableRbac ? AccessControlUrls.getAccessControlProfileRbac : AccessControlUrls.getAccessControlProfile,
          { policyId: policy.id }
        )
        const acl = await fetchWithBQ(aclPolicyDetail)
        const aclData = acl.data as unknown as EnhancedAccessControlInfoType

        return {
          ...aclData,
          ...policy,
          networkIds: aclData.networkIds
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`AccessControlProfile ${policy.id} get additional attribute error:`, e)
        return {
          ...policy
        }
      }
    }

    const result = await fetchAdditionalData(aclPolicyList, processFn)

    return aclPolicyListInfoQuery.data
      ? { data: result.data }
      : { error: aclPolicyListInfoQuery.error as FetchBaseQueryError }
  }
}

// eslint-disable-next-line max-len
export function getEnhancedL2AclProfileListFn () : QueryFn<TableResult<L2AclPolicy>, RequestPayload> {
  // eslint-disable-next-line max-len
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const l2AclPolicyListInfo = {
      // eslint-disable-next-line max-len
      ...createHttpRequest(enableRbac ? AccessControlUrls.getL2AclPolicyListQuery : AccessControlUrls.getEnhancedL2AclPolicies, params),
      body: enableRbac ? JSON.stringify(payload) : payload
    }

    const l2AclPolicyListInfoQuery = await fetchWithBQ(l2AclPolicyListInfo)
    const l2AclPolicyList = l2AclPolicyListInfoQuery.data as TableResult<L2AclPolicy>

    // fill in the mac addresses
    const processFn = async (policy: L2AclPolicy) => {
      if (!enableRbac) return policy

      try {
        // eslint-disable-next-line max-len
        const l2AclPolicyDetail = createHttpRequest(
          enableRbac ? AccessControlUrls.getL2AclPolicyRbac : AccessControlUrls.getL2AclPolicy,
          { l2AclPolicyId: policy.id }
        )
        const l2Acl = await fetchWithBQ(l2AclPolicyDetail)
        const l2AclData = l2Acl.data as unknown as l2AclPolicyInfoType

        return {
          ...policy,
          macAddress: l2AclData.macAddresses
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`l2AclPolicy ${policy.id} getMacAddresses error:`, e)
        return {
          ...policy
        }
      }
    }

    const result = await fetchAdditionalData(l2AclPolicyList, processFn)

    return l2AclPolicyListInfoQuery.data
      ? { data: result.data }
      : { error: l2AclPolicyListInfoQuery.error as FetchBaseQueryError }
  }
}

// eslint-disable-next-line max-len
export function getEnhancedL3AclProfileListFn () : QueryFn<TableResult<L3AclPolicy>, RequestPayload> {
  // eslint-disable-next-line max-len
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const l3AclPolicyListInfo = {
      ...createHttpRequest(
        // eslint-disable-next-line max-len
        enableRbac ? AccessControlUrls.getL3AclPolicyListQuery : AccessControlUrls.getEnhancedL3AclPolicies,
        params
      ),
      body: enableRbac ? JSON.stringify(payload) : payload
    }

    const l3AclPolicyListInfoQuery = await fetchWithBQ(l3AclPolicyListInfo)
    const l3AclPolicyList = l3AclPolicyListInfoQuery.data as TableResult<L3AclPolicy>

    // fill in rules and network data
    const processFn = async (policy: L3AclPolicy) => {
      if (!enableRbac) return policy

      try {
        const l3AclPolicyDetail = createHttpRequest(
          enableRbac ? AccessControlUrls.getL3AclPolicyRbac : AccessControlUrls.getL3AclPolicy,
          { l3AclPolicyId: policy.id }
        )
        const l3Acl = await fetchWithBQ(l3AclPolicyDetail)
        const l3AclData = l3Acl.data as unknown as l3AclPolicyInfoType

        return {
          ...policy,
          l3Rules: l3AclData.l3Rules
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`l3AclPolicy ${policy.id} get additional attribute error:`, e)
        return {
          ...policy
        }
      }
    }

    const result = await fetchAdditionalData(l3AclPolicyList, processFn)

    return l3AclPolicyListInfoQuery.data
      ? { data: result.data }
      : { error: l3AclPolicyListInfoQuery.error as FetchBaseQueryError }
  }
}

// eslint-disable-next-line max-len
export function getEnhancedDeviceProfileListFn () : QueryFn<TableResult<DevicePolicy>, RequestPayload> {
  // eslint-disable-next-line max-len
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const devicePolicyListInfo = {
      // eslint-disable-next-line max-len
      ...createHttpRequest(enableRbac ? AccessControlUrls.getDevicePolicyListQuery : AccessControlUrls.getEnhancedDevicePolicies, params),
      body: enableRbac ? JSON.stringify(payload) : payload
    }

    const devicePolicyListInfoQuery = await fetchWithBQ(devicePolicyListInfo)
    const devicePolicyList = devicePolicyListInfoQuery.data as TableResult<DevicePolicy>

    // fill in rules and network data
    const processFn = async (policy: DevicePolicy) => {
      if (!enableRbac) return policy

      try {
        const devicePolicyDetail = createHttpRequest(
          enableRbac ? AccessControlUrls.getDevicePolicyRbac : AccessControlUrls.getDevicePolicy,
          { devicePolicyId: policy.id }
        )
        const devicePolicy = await fetchWithBQ(devicePolicyDetail)
        const deviceData = devicePolicy.data as unknown as devicePolicyInfoType

        return {
          ...policy,
          added_check: deviceData
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`DevicePolicy ${policy.id} get additional attribute error:`, e)
        return {
          ...policy
        }
      }
    }

    const result = await fetchAdditionalData(devicePolicyList, processFn)

    return devicePolicyListInfoQuery.data
      ? { data: result.data }
      : { error: devicePolicyListInfoQuery.error as FetchBaseQueryError }
  }
}

// eslint-disable-next-line max-len
export function getEnhancedApplicationProfileListFn () : QueryFn<TableResult<ApplicationPolicy>, RequestPayload> {
  // eslint-disable-next-line max-len
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    const applicationPolicyListInfo = {
      // eslint-disable-next-line max-len
      ...createHttpRequest(enableRbac ? AccessControlUrls.getApplicationPolicyListQuery : AccessControlUrls.getEnhancedApplicationPolicies, params),
      body: enableRbac ? JSON.stringify(payload) : payload
    }

    const applicationPolicyListInfoQuery = await fetchWithBQ(applicationPolicyListInfo)
    // eslint-disable-next-line max-len
    const applicationPolicyList = applicationPolicyListInfoQuery.data as TableResult<ApplicationPolicy>

    // fill in rules and network data
    const processFn = async (policy: ApplicationPolicy) => {
      if (!enableRbac) return policy

      try {
        const applicationPolicyDetail = createHttpRequest(
          enableRbac ? AccessControlUrls.getAppPolicyRbac : AccessControlUrls.getAppPolicy,
          { applicationPolicyId: policy.id }
        )
        const applicationPolicy = await fetchWithBQ(applicationPolicyDetail)
        const applicationData = applicationPolicy.data as unknown as appPolicyInfoType

        return {
          ...policy,
          added_check: applicationData
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`ApplicationPolicy ${policy.id} get additional attribute error:`, e)
        return {
          ...policy
        }
      }
    }

    const result = await fetchAdditionalData(applicationPolicyList, processFn)

    return applicationPolicyListInfoQuery.data
      ? { data: result.data }
      : { error: applicationPolicyListInfoQuery.error as FetchBaseQueryError }
  }
}







