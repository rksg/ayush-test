import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { CommonResult, EnhancedRoguePolicyType, GetApiVersionHeader, RogueApSettingsRequest, RoguePolicyRequest, TableResult, VenueRogueAp } from '@acx-ui/rc/utils'
import { ApiInfo, batchApi, createHttpRequest }                                                                                              from '@acx-ui/utils'

import { ExecuteQueryProps } from './common'

interface ExecuteRoguePolicyProps extends ExecuteQueryProps<RoguePolicyRequest> {
  activateRoguePolicyApiInfo: ApiInfo
}

export async function executeAddRoguePolicy (props: ExecuteRoguePolicyProps) {
  // eslint-disable-next-line max-len
  const { queryArgs, apiInfo, apiVersionKey, rbacApiInfo, rbacApiVersionKey, activateRoguePolicyApiInfo, fetchWithBQ } = props

  try {
    const { params, payload, enableRbac } = queryArgs
    const { name, description, rules, venues } = payload!
    const headers = GetApiVersionHeader(enableRbac ? rbacApiVersionKey : apiVersionKey)
    const res = await fetchWithBQ({
      ...createHttpRequest(enableRbac ? rbacApiInfo : apiInfo, params, headers),
      body: JSON.stringify({
        name,
        description,
        rules,
        venues
      })
    })
    // Ensure the return type is QueryReturnValue
    if (res.error) {
      return { error: res.error as FetchBaseQueryError }
    }

    if (enableRbac) { // Continue with venue activation if RBAC is enabled
      const { response } = res.data as CommonResult
      const requests = venues.map(venue => ({
        params: { policyId: response?.id, venueId: venue.id }
      }))
      await batchApi(activateRoguePolicyApiInfo, requests, fetchWithBQ, headers)
    }

    return { data: res.data as CommonResult }
  } catch (error) {
    return { error: error as FetchBaseQueryError }
  }
}

export async function executeUpdateRoguePolicy<ReturnType> (props: ExecuteRoguePolicyProps) {
  // eslint-disable-next-line max-len
  const { queryArgs, apiInfo, apiVersionKey, rbacApiInfo, rbacApiVersionKey, activateRoguePolicyApiInfo, fetchWithBQ } = props

  try {
    const { params, payload, enableRbac } = queryArgs
    const { id: policyId, name, description, rules, venues, oldVenues, defaultPolicyId } = payload!
    const headers = GetApiVersionHeader(enableRbac ? rbacApiVersionKey : apiVersionKey)

    const res = await fetchWithBQ({
      ...createHttpRequest(enableRbac ? rbacApiInfo : apiInfo, params, headers),
      body: JSON.stringify({
        policyId,
        name,
        description,
        rules,
        venues
      })
    })
    // Ensure the return type is QueryReturnValue
    if (res.error) {
      return { error: res.error as FetchBaseQueryError }
    }

    if (enableRbac) {
      const deactivateRequests = oldVenues
        .filter(oldVenue => !venues.some(venue => venue.id === oldVenue.id))
        .map(venue => ({ params: { policyId: defaultPolicyId, venueId: venue.id } }))

      const activateRequests = venues
        .filter(venue => !oldVenues.some(oldVenue => oldVenue.id === venue.id))
        .map(venue => ({ params: { policyId, venueId: venue.id } }))

      const [deactivationRes, activationRes] = await Promise.all([
        batchApi(activateRoguePolicyApiInfo, deactivateRequests, fetchWithBQ, headers),
        batchApi(activateRoguePolicyApiInfo, activateRequests, fetchWithBQ, headers)
      ])

      if (deactivationRes.error || activationRes.error) {
        return { error: deactivationRes.error || activationRes.error as FetchBaseQueryError }
      }
    }

    return { data: res.data as ReturnType }
  } catch (error) {
    return { error: error as FetchBaseQueryError }
  }
}

interface ExecuteGetVenueRoguePolicyProps extends ExecuteQueryProps {
  roguePolicyListRbacApiInfo: ApiInfo
}
// eslint-disable-next-line max-len
export async function executeGetVenueRoguePolicy (props: ExecuteGetVenueRoguePolicyProps) {
  // eslint-disable-next-line max-len
  const { queryArgs, apiInfo, apiVersionKey, rbacApiInfo, rbacApiVersionKey, roguePolicyListRbacApiInfo, fetchWithBQ } = props
  const { params, enableRbac } = queryArgs

  try {
    const customHeaders = GetApiVersionHeader(enableRbac ? rbacApiVersionKey : apiVersionKey)
    if (enableRbac) {
      const [venueRogueApResponse, roguePolicyResponse] = await Promise.all([
        fetchWithBQ(createHttpRequest(rbacApiInfo, params, customHeaders)),
        fetchWithBQ({
          ...createHttpRequest(roguePolicyListRbacApiInfo, params, customHeaders),
          body: JSON.stringify({ filters: { venueIds: [params?.venueId] }, fields: ['id'] })
        })
      ])

      const roguePolicySetting = venueRogueApResponse.data as VenueRogueAp
      const roguePolicy = roguePolicyResponse.data as TableResult<EnhancedRoguePolicyType>
      return {
        data: {
          enabled: roguePolicy.totalCount > 0,
          roguePolicyId: (roguePolicy.totalCount > 0) ? roguePolicy.data[0].id : null,
          reportThreshold: roguePolicySetting.reportThreshold
        } as VenueRogueAp
      }
    } else {
      const req = createHttpRequest(apiInfo, params, customHeaders)
      const res = await fetchWithBQ(req)
      // Ensure the return type is QueryReturnValue
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      } else {
        return { data: res.data as VenueRogueAp }
      }
    }
  } catch (error) {
    return { error: error as FetchBaseQueryError }
  }
}

interface ExecuteUpdateVenueRoguePolicyProps extends ExecuteQueryProps<RogueApSettingsRequest> {
  activateRoguePolicy: ApiInfo
  deactivateRoguePolicy: ApiInfo
}
// eslint-disable-next-line max-len
export async function executeUpdateVenueRoguePolicy (props: ExecuteUpdateVenueRoguePolicyProps) {
  // eslint-disable-next-line max-len
  const { queryArgs, apiInfo, apiVersionKey, rbacApiInfo, rbacApiVersionKey, activateRoguePolicy, deactivateRoguePolicy, fetchWithBQ } = props
  const { params, payload, enableRbac } = queryArgs

  try {
    const customHeaders = GetApiVersionHeader(enableRbac ? rbacApiVersionKey : apiVersionKey)
    if (enableRbac) {
      // eslint-disable-next-line max-len
      const { enabled, reportThreshold, roguePolicyId, currentRoguePolicyId, currentReportThreshold } = payload!
      if (enabled) {
        const promises = []
        if (currentRoguePolicyId !== roguePolicyId) {
          const activateRoguePolicyPromise = fetchWithBQ(createHttpRequest(activateRoguePolicy, {
            policyId: roguePolicyId,
            venueId: params?.venueId
          }, customHeaders))
          promises.push(activateRoguePolicyPromise)
        }

        if (currentReportThreshold !== reportThreshold) {
          const updateVenueRogueApPromise = fetchWithBQ({
            ...createHttpRequest(rbacApiInfo, params, customHeaders),
            body: JSON.stringify({ reportThreshold })
          })
          promises.push(updateVenueRogueApPromise)
        }

        await Promise.all(promises)
      } else {
        await fetchWithBQ(
          createHttpRequest(deactivateRoguePolicy,
            { policyId: currentRoguePolicyId, venueId: params?.venueId },
            customHeaders))
      }
      return { data: { enabled, reportThreshold, roguePolicyId } as VenueRogueAp }
    } else {
      const req = {
        ...createHttpRequest(apiInfo, params, customHeaders),
        body: payload
      }
      const res = await fetchWithBQ(req)
      // Ensure the return type is QueryReturnValue
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      } else {
        return { data: res.data as VenueRogueAp }
      }
    }
  } catch (error) {
    return { error: error as FetchBaseQueryError }
  }
}
