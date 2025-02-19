import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import {
  CommonResult, CommonUrlsInfo,
  EnhancedRoguePolicyType,
  PoliciesConfigTemplateUrlsInfo,
  RogueAPDetectionTempType,
  RogueApSettingsRequest,
  RogueApUrls,
  RoguePolicyRequest,
  TableResult,
  VenueRogueAp,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { batchApi, createHttpRequest } from '@acx-ui/utils'

import { QueryFn } from './common'

/* eslint-disable max-len */
export function addRoguePolicyFn (isTemplate: boolean = false) : QueryFn<CommonResult, RoguePolicyRequest> {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const api = isTemplate ? PoliciesConfigTemplateUrlsInfo : RogueApUrls
      const { name, description, rules, venues } = payload!
      const res = await fetchWithBQ({
        ...createHttpRequest(enableRbac ? api.addRoguePolicyRbac : api.addRoguePolicy, params),
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
        await batchApi(api.activateRoguePolicy, requests, fetchWithBQ)
      }

      return { data: res.data as CommonResult }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

export function updateRoguePolicyFn (isTemplate : boolean = false) : QueryFn<RogueAPDetectionTempType, RoguePolicyRequest> {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const api = isTemplate ? PoliciesConfigTemplateUrlsInfo : RogueApUrls
      const { id: policyId, name, description, rules, venues, oldVenues, defaultPolicyId } = payload!

      const res = await fetchWithBQ({
        ...createHttpRequest(enableRbac ? api.updateRoguePolicyRbac : api.updateRoguePolicy, params),
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
          batchApi(api.activateRoguePolicy, deactivateRequests, fetchWithBQ),
          batchApi(api.activateRoguePolicy, activateRequests, fetchWithBQ)
        ])

        if (deactivationRes.error || activationRes.error) {
          return { error: deactivationRes.error || activationRes.error as FetchBaseQueryError }
        }
      }

      return { data: res.data as RogueAPDetectionTempType }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

export function getVenueRoguePolicyFn (isTemplate : boolean = false) : QueryFn<VenueRogueAp> {
  return async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const api = isTemplate ? PoliciesConfigTemplateUrlsInfo : RogueApUrls
      if (enableRbac) {
        const [venueRogueApResponse, roguePolicyResponse] = await Promise.all([
          fetchWithBQ(createHttpRequest(isTemplate ? PoliciesConfigTemplateUrlsInfo.getVenueRogueApRbac : WifiRbacUrlsInfo.getVenueRogueAp, params)),
          fetchWithBQ({
            ...createHttpRequest(api.getRoguePolicyListRbac, params),
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
        const req = createHttpRequest(isTemplate ? PoliciesConfigTemplateUrlsInfo.getVenueRogueAp : CommonUrlsInfo.getVenueRogueAp, params)
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
}

export function updateVenueRoguePolicyFn (isTemplate : boolean = false) : QueryFn<VenueRogueAp, RogueApSettingsRequest> {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const api = isTemplate ? PoliciesConfigTemplateUrlsInfo : RogueApUrls
      if (enableRbac) {
        const { enabled, reportThreshold, roguePolicyId, currentRoguePolicyId, currentReportThreshold } = payload!
        if (enabled) {
          const promises = []
          if (currentRoguePolicyId !== roguePolicyId) {
            const promise = fetchWithBQ(createHttpRequest(api.activateRoguePolicy, {
              policyId: roguePolicyId,
              venueId: params?.venueId
            }))
            promises.push(promise)
          }

          if (currentReportThreshold !== reportThreshold) {
            const updateVenueRogueApPromise = fetchWithBQ({
              ...createHttpRequest(isTemplate ? PoliciesConfigTemplateUrlsInfo.updateVenueRogueApRbac : WifiRbacUrlsInfo.updateVenueRogueAp, params),
              body: JSON.stringify({ reportThreshold })
            })
            promises.push(updateVenueRogueApPromise)
          }

          await Promise.all(promises)
        } else {
          await fetchWithBQ(
            createHttpRequest(api.deactivateRoguePolicy, { policyId: currentRoguePolicyId, venueId: params?.venueId }))
        }
        return { data: { enabled, reportThreshold, roguePolicyId } as VenueRogueAp }
      } else {
        const req = {
          ...createHttpRequest(isTemplate ? PoliciesConfigTemplateUrlsInfo.updateVenueRogueAp : CommonUrlsInfo.updateVenueRogueAp, params),
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
}
