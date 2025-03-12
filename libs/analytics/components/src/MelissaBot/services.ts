import moment from 'moment'

import { getUserProfile as getUserProfileRA } from '@acx-ui/analytics/utils'
import { getJwtHeaders }                      from '@acx-ui/utils'

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
    },
    queryParams?:{
      resetContexts?:boolean
    }
  }

const MELISSA_URL_ORIGIN = window.location.origin
const MELISSA_URL_BASE_PATH = '/analytics'
const MELISSA_ROUTE_PATH = '/api/ask-mlisa'

// To connect with local chatbot
// const MELISSA_URL_ORIGIN='http://localhost:31337'
// const MELISSA_URL_BASE_PATH=''
// const MELISSA_ROUTE_PATH=''

const generateUploadUrl = (id: string) => {
  const baseUrl = `${MELISSA_URL_ORIGIN}${MELISSA_URL_BASE_PATH}`
  const routePath = `${MELISSA_ROUTE_PATH}/upload/${id}`
  return `${baseUrl}${routePath}`
}

export const queryAskMelissa = async (body: AskMelissaBody) => {
  const { userId } = getUserProfileRA()
  // eslint-disable-next-line max-len
  const melissaApiEndpoint = `${MELISSA_ROUTE_PATH}/v1/integrations/messenger/webhook/melissa-agent/sessions/dfMessenger-${userId}`
  const melissaApiUrl = `${MELISSA_URL_ORIGIN}${MELISSA_URL_BASE_PATH}${melissaApiEndpoint}`

  const response = await fetch(melissaApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Mlisa-Timezone': moment.tz.guess(),
      'X-Set-Ruckus-Ai': 'true',
      ...getJwtHeaders()
    },
    body: JSON.stringify(body)
  })

  const json = await response.json()
  return json
}

export const uploadFile = async (incidentId: string, form: FormData) => {
  const uploadUrl = generateUploadUrl(incidentId)
  const headers = {
    'X-Mlisa-Timezone': moment.tz.guess(),
    'X-Set-Ruckus-Ai': 'true',
    ...getJwtHeaders()
  }

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers,
    body: form
  })

  return response
}
