import { gql }            from 'graphql-request'
import moment, { Moment } from 'moment-timezone'

import { intentAIApi } from '@acx-ui/store'

import { Intent }     from './config'
import { IntentWlan } from './utils'

type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

export type SettingsType = {
  date: Moment | null,
  hour: number | null
}

export function roundUpTimeToNearest15Minutes (timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15
  const roundedHours = Math.floor(roundedMinutes / 60)
  const roundedMinutesInHour = roundedMinutes % 60
  const decimalHour = roundedHours + roundedMinutesInHour / 60
  return decimalHour
}

function decimalToTimeString (decimalHours: number) {
  const hours = Math.floor(decimalHours)
  const fractionalHours = decimalHours - hours
  const minutes = Math.floor(fractionalHours * 60)
  const seconds = Math.round((fractionalHours * 60 - minutes) * 60)
  const time = moment.utc().set({ hour: hours, minute: minutes, second: seconds })
  return time.format('HH:mm:ss')
}

export function getLocalScheduledAt (date: Moment, hour: number) {
  const newDate = date.format('YYYY-MM-DD')
  const newHour = decimalToTimeString(hour)
  const offset = moment().format('Z').replace(':00', '')
  return `${newDate}T${newHour}${offset}`
}

// export function processDtoToPayload (dto: Intent) { // this function handle tz diff, checking of etl buffer done in summary
//   const localScheduledAt = getLocalScheduledAt(dto!.settings!.date!, dto.settings!.hour!)
//   const newScheduledAt = handleScheduledAt(localScheduledAt)
//   const utcScheduledAt = moment.parseZone(newScheduledAt).utc().toISOString()
//   return {
//     id: dto.id,
//     status: dto.status,
//     metadata: {
//       scheduledAt: utcScheduledAt,
//       preferences: dto.preferences
//     }
//   }
// }

type IntentTransitionPayload = {
  id: Intent['id']
  status: Intent['status']
  displayStatus?: Intent['displayStatus']
  metadata?: {
    scheduledAt?: string
    preferences?: Record<string, unknown>
    wlans?: IntentWlan[]
  }
}

export const { useIntentTransitionMutation } = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentTransition: build.mutation<MutationResponse, IntentTransitionPayload>({
      query: (variables) => ({
        variables,
        document: gql`
          mutation IntentTransition (
            $id: String!
            $status: String!
            $displayStatus: String
            $metadata: JSON
          ) {
            transition (
              id: $id
              status: $status
              scheduledAt: $scheduledAt
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
