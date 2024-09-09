import React, { useCallback, useEffect } from 'react'

import { gql }                       from 'graphql-request'
import moment, { Moment }            from 'moment-timezone'
import { FormattedMessage, useIntl } from 'react-intl'

import { showToast }         from '@acx-ui/components'
import { useNavigateToPath } from '@acx-ui/react-router-dom'
import { intentAIApi }       from '@acx-ui/store'

import { validateScheduleTiming }                 from './common/ScheduleTiming'
import { aiFeaturesLabel, codes, Intent }         from './config'
import { useIntentContext }                       from './IntentContext'
import { DisplayStates, Statuses, StatusReasons } from './states'
import { IntentWlan }                             from './utils'

type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

export type SettingsType = {
  date: Moment
  time: number
}

export type FormValues <Preferences> = {
  id: string
  status: Statuses
  statusReason?: StatusReasons
  displayStatus?: DisplayStates
  preferences?: Preferences
  settings: SettingsType
}

export type IntentTransitionPayload <Preferences = unknown> = {
  id: Intent['id']
  status: Intent['status']
  statusReason?: Intent['statusReason']
  metadata?: {
    scheduledAt?: string
    preferences?: Preferences
    wlans?: IntentWlan[]
  }
}

const { useIntentTransitionMutation } = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentTransition: build.mutation<MutationResponse, IntentTransitionPayload<unknown>>({
      query: (variables) => ({
        variables,
        document: gql`
          mutation IntentTransition (
            $id: String!
            $status: String!
            $statusReason: String
            $metadata: JSON
          ) {
            transition (
              id: $id
              status: $status
              statusReason: $statusReason
              metadata: $metadata
            ) { success errorMsg errorCode }
          }`
      }),
      transformResponse: (response: { transition: MutationResponse }) => response.transition,
      invalidatesTags: [
        { type: 'Intent', id: 'INTENT_DETAILS' },
        { type: 'Intent', id: 'INTENT_AI_LIST' },
        { type: 'Intent', id: 'INTENT_AI_FILTER_OPTIONS' }
      ]
    })
  })
})

export function useInitialValues <Preferences> () {
  const { id, metadata, status, statusReason, displayStatus } = useIntentContext().intent
  const settings = metadata?.scheduledAt ? {
    date: moment(metadata.scheduledAt),
    time: moment.duration(moment(metadata.scheduledAt).format('HH:mm:ss')).asHours()
  } : { date: undefined, time: undefined }
  return { id, status, statusReason, displayStatus, settings } as FormValues<Preferences>
}

export function createUseIntentTransition <Preferences> (
  getFormDTO: (values: FormValues<Preferences>) => IntentTransitionPayload<Preferences>
) {
  return function useIntentTransition () {
    const { $t } = useIntl()
    const { intent } = useIntentContext()
    const navigate = useNavigateToPath('/analytics/intentAI')
    const [doSubmit, response] = useIntentTransitionMutation()

    const submit = useCallback(async (values: FormValues<Preferences>) => {
      return validateScheduleTiming(values) ? doSubmit(getFormDTO(values)) : false
    }, [doSubmit])

    useEffect(() => {
      if (!response.data) return

      if (response.data.success) {
        const feature = codes[intent.code]
        showToast({
          type: 'success',
          content: <FormattedMessage
            defaultMessage='{feature}: {intent} for {sliceValue} has been updated'
            values={{
              feature: $t(aiFeaturesLabel[feature.aiFeature]),
              intent: $t(feature.intent),
              sliceValue: intent.sliceValue
            }}
          />
        })
        navigate()
      } else {
        showToast({ type: 'error', content: response.data.errorMsg })
      }
    }, [$t, navigate, intent, response])

    return { submit, response }
  }
}
