/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                       from 'lodash'

import {
  DpskMutationResult,
  DpskSaveData,
  DpskUrls, ServicesConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { createHttpRequest } from '@acx-ui/utils'

import { QueryFn } from './common'

export function addDpskFn (isTemplate: boolean = false) : QueryFn<DpskMutationResult, DpskSaveData> {
  const api = (isTemplate) ? ServicesConfigTemplateUrlsInfo : DpskUrls
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const res = await fetchWithBQ({
        ...createHttpRequest(api.addDpsk, params),
        body: JSON.stringify((enableRbac) ? _.omit(payload, 'policySetId') : payload)
      })
      // Ensure the return type is QueryReturnValue
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      }
      const { id } = res.data as DpskMutationResult

      if (enableRbac && !isTemplate && payload!.policySetId) {
        await fetchWithBQ({
          ...createHttpRequest(api.updateDpskPolicySet, {
            serviceId: id,
            policySetId: payload!.policySetId })
        })
      }

      return { data: res.data as DpskMutationResult }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

export function updateDpskFn (isTemplate: boolean = false) : QueryFn<DpskMutationResult, DpskSaveData> {
  const api = (isTemplate) ? ServicesConfigTemplateUrlsInfo : DpskUrls
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const res = await fetchWithBQ({
        ...createHttpRequest(api.updateDpsk, params),
        body: JSON.stringify((enableRbac) ? _.omit(payload, 'policySetId') : payload)
      })
      // Ensure the return type is QueryReturnValue
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      }

      if (enableRbac && !isTemplate) {
        // Get the current Dpsk Service data
        const getDpskRes = await fetchWithBQ({
          ...createHttpRequest(api.getDpsk, params)
        })

        if (getDpskRes.error) {
          return { error: getDpskRes.error as FetchBaseQueryError }
        }

        const currentDpsk = getDpskRes.data as DpskSaveData
        if (payload!.policySetId !== currentDpsk.policySetId) {
          if (payload!.policySetId) {
            await fetchWithBQ({
              ...createHttpRequest(api.updateDpskPolicySet, { ...params, policySetId: payload!.policySetId })
            })
          } else {
            await fetchWithBQ({
              ...createHttpRequest(api.deleteDpskPolicySet, { ...params })
            })
          }
        }
      }

      return { data: res.data as DpskMutationResult }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}

export function addDpskWithIdentityGroupFn () : QueryFn<DpskMutationResult, DpskSaveData> {
  const api = DpskUrls
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      payload = _.omit(payload, 'identityGroupId')
      const res = await fetchWithBQ({
        ...createHttpRequest(api.createDpskWithIdentityGroup, params),
        body: JSON.stringify((enableRbac) ? _.omit(payload, 'policySetId') : payload)
      })
      // Ensure the return type is QueryReturnValue
      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      }
      const { id } = res.data as DpskMutationResult

      if (enableRbac && payload!.policySetId) {
        await fetchWithBQ({
          ...createHttpRequest(api.updateDpskPolicySet, {
            serviceId: id,
            policySetId: payload!.policySetId })
        })
      }

      return { data: res.data as DpskMutationResult }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}
