import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/store'

import { SLAKeys } from '../../types'

import { slaConfig } from './constants'

interface SLAResult {
  value: number;
  isSynced: boolean;
  isDefault?: boolean;
}

export type SLAData = Partial<{
  [key in SLAKeys]: SLAResult;
}>

export interface QueryPayload {
  mspEcIds: string[];
}

export interface MutationPayload {
  mspEcIds: string[];
  slasToUpdate: Partial<Record<SLAKeys, number>>;
}

export const getSlaThresholdValue = (data: SLAData) => {
  if (!data) {
    return {} as SLAData
  }

  const updatedData = Object.fromEntries(
    Object.entries(data)
      .map(([key, result]) => {
        if (result.value !== null) {
          return [key, result]
        }

        const defaultValue = slaConfig[key as SLAKeys].defaultValue
        if (defaultValue == null) {
          return []
        }

        return [key, {
          ...result,
          value: defaultValue,
          isDefault: true
        }]
      })
      .filter((entry) => entry.length)
  ) as SLAData

  return updatedData
}

export const mduThresholdQuery = () => {
  let queryBody = ''

  Object.entries(slaConfig).forEach(([key, { apiMetric }]) => {
    queryBody += `
      ${key}: MDUThreshold(
        name: "${apiMetric}"
        mspEcIds: $mspEcIds
      ) {
        value
        isSynced
      }`
  })

  return gql`query GetMDUThresholds(
      $mspEcIds: [String]
    ) {
      ${queryBody}
    }`
}

export const mduThresholdMutation = (
  slasToUpdate: MutationPayload['slasToUpdate']
) => {
  let mutationBody = `mutation SaveMultipleThresholds(
    $mspEcIds: [String]
    ${Object.keys(slasToUpdate)
    .map((key) => `$${key}: Float!`)
    .join('\n')}
  ) { `

  Object.keys(slasToUpdate).forEach((key) => {
    mutationBody += `
      ${key}: MDUThreshold(
        name: "${slaConfig[key as SLAKeys].apiMetric}"
        value: $${key}
        mspEcIds: $mspEcIds
      ) { success }`
  })

  mutationBody += '}'

  return gql`${mutationBody}`
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    slaThresholds: build.query<SLAData, QueryPayload>({
      query: (payload) => ({
        document: mduThresholdQuery(),
        variables: payload
      }),
      transformResponse: (response: SLAData) => getSlaThresholdValue(response),
      providesTags: [{ type: 'MDU', id: 'kpi_threshold' }]
    }),
    updateSlaThresholds: build.mutation<SLAData, MutationPayload>({
      query: ({ slasToUpdate, ...payload }) => ({
        document: mduThresholdMutation(slasToUpdate),
        variables: { ...payload, ...slasToUpdate }
      }),
      invalidatesTags: [{ type: 'MDU', id: 'kpi_threshold' }]
    })
  })
})

export const { useSlaThresholdsQuery, useUpdateSlaThresholdsMutation } = api
