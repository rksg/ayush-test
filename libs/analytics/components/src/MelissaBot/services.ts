import moment from 'moment'

import { getUserProfile as getUserProfileRA } from '@acx-ui/analytics/utils'

export interface AskMelissaBody {
    queryInput: {
      event?: {
        languageCode: string
        name: string
      }
      text?: {
        languageCode: string,
        text: string
      }
    }
  }

const MELISSA_URL_ORIGIN=window.location.origin
const MELISSA_URL_BASE_PATH='/analytics'
const MELISSA_ROUTE_PATH='/api/ask-mlisa'

// To connect with local chatbot
// const MELISSA_URL_ORIGIN='http://localhost:31337'
// const MELISSA_URL_BASE_PATH=''
// const MELISSA_ROUTE_PATH=''

const uploadUrl = (id:string) => `${MELISSA_URL_ORIGIN}${MELISSA_URL_BASE_PATH}`+
  `${MELISSA_ROUTE_PATH}/upload/${id}`

export const queryAskMelissa=async (body:AskMelissaBody)=>{
  const { userId } = getUserProfileRA()
  const MELISSA_API_ENDPOINT=`${MELISSA_ROUTE_PATH}/v1/integrations/messenger` +
  `/webhook/melissa-agent/sessions/dfMessenger-${userId}`
  const MELISSA_API_URL=`${MELISSA_URL_ORIGIN}${MELISSA_URL_BASE_PATH}${MELISSA_API_ENDPOINT}`
  const response=await fetch(MELISSA_API_URL,
    { method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Mlisa-Timezone': moment.tz.guess(),
        'X-Set-Ruckus-Ai': 'true'
      },
      body: JSON.stringify(body)
    })
  const json = await response.json()
  return json
}

export const uploadFile = (incidentId:string,form:FormData)=>{
  return fetch(uploadUrl(incidentId), {
    method: 'POST',
    headers: {
      'X-Mlisa-Timezone': moment.tz.guess(),
      'X-Set-Ruckus-Ai': 'true'
    },
    body: form
  })
}