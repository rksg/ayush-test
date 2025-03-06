import { useCallback, useEffect, useRef } from 'react'

import { gql }                       from 'graphql-request'
import moment, { Moment }            from 'moment-timezone'
import { FormattedMessage, useIntl } from 'react-intl'

import { showToast }                                     from '@acx-ui/components'
import { useNavigate, useNavigateToPath, useTenantLink } from '@acx-ui/react-router-dom'
import { intentAIApi }                                   from '@acx-ui/store'
import { encodeParameter }                               from '@acx-ui/utils'

import { validateScheduleTiming } from './common/ScheduleTiming'
import {
  aiFeaturesLabel,
  codes,
  stateToGroupedStates,
  Intent,
  IntentWlan
} from './config'
import { Wlan }                                   from './EquiFlex/IntentAIForm/WlanSelection'
import { useIntentContext }                       from './IntentContext'
import { DisplayStates, Statuses, StatusReasons } from './states'
import { getUserName }                            from './useIntentAIActions'
import { TransitionIntentMetadata }               from './utils'

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
  wlans?: Wlan[]
}

export type IntentTransitionPayload <Preferences = unknown> = {
  id: Intent['id']
  status: Intent['status']
  statusReason?: Intent['statusReason']
  metadata?: {
    scheduledAt?: string
    preferences?: Preferences
    wlans?: IntentWlan[]
    changedByName?: string
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
  let settings: { date?: Moment, time?: number } = { date: undefined, time: undefined }

  if (status === Statuses.new) {
    settings = { date: moment(), time: undefined }
  } else if (metadata?.scheduledAt) {
    settings = {
      date: moment(metadata.scheduledAt),
      time: moment.duration(moment(metadata.scheduledAt).format('HH:mm:ss')).asHours()

    }
  }
  return { id, status, statusReason, displayStatus, settings } as FormValues<Preferences>
}

const intentAIPath = '/analytics/intentAI'

export function createUseIntentTransition <Preferences> (
  getFormDTO: (values: FormValues<Preferences>) => IntentTransitionPayload<Preferences>
) {
  return function useIntentTransition () {
    const { $t } = useIntl()
    const { intent } = useIntentContext()
    const intentRef = useRef(intent)
    const basePath = useTenantLink(intentAIPath)
    const navigate = useNavigate()
    const navigateToTable = useNavigateToPath(intentAIPath)
    const [doSubmit, response] = useIntentTransitionMutation()

    const submit = useCallback(async (values: FormValues<Preferences>) => {
      const formDto = getFormDTO(values)
      const metadataWithName = {
        ...formDto?.metadata,
        changedByName: getUserName()
      } as TransitionIntentMetadata
      return validateScheduleTiming(values) ? doSubmit({
        ...formDto, metadata: metadataWithName
      }) : false
    }, [doSubmit])

    useEffect(() => {
      if (!response.data) return

      if (response.data.success) {
        const featureValue = $t(aiFeaturesLabel[codes[intentRef.current.code].aiFeature])
        const intentValue = $t(codes[intentRef.current.code].intent)
        const sliceValue = intentRef.current.sliceValue
        showToast({
          type: 'success',
          content: <FormattedMessage
            defaultMessage='{feature}: {intent} for {sliceValue} has been updated'
            values={{
              feature: featureValue,
              intent: intentValue,
              sliceValue: sliceValue
            }}
          />
          ,
          link: {
            text: 'View',
            onClick: () => {
              const { status, statusReason } = response.originalArgs!
              const key = [status, statusReason].filter(Boolean).join('-')
              const statusLabel = stateToGroupedStates[key as unknown as DisplayStates]?.key || key
              const intentFilter = {
                aiFeature: [featureValue],
                intent: [intentValue],
                category: [$t(codes[intentRef.current.code].category)],
                sliceValue: [intentRef.current.sliceId],
                statusLabel: [statusLabel]
              }
              const encodedParameters = encodeParameter(intentFilter)
              const newSearch =
                new URLSearchParams(basePath.search)
              newSearch.set('intentTableFilters', encodedParameters)
              navigate({
                ...basePath,
                search: newSearch.toString()
              })
            }
          }
        })
        navigateToTable()
      } else {
        showToast({ type: 'error', content: response.data.errorMsg })
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [$t, navigate, response])

    return { submit, response }
  }
}
