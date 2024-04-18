import { trimEnd } from 'lodash'

type commonEnvironment = {
  SPLIT_IO_KEY: string
  PENDO_API_KEY: string
  STATIC_ASSETS: string
  SPLIT_PROXY_ENDPOINT: string
  DRUID_RETAIN_PERIOD_DAYS: string
}

/**
 * Steps to add new env var
 * 1. Define new env var in the `R1Environment` below
 * 2. Update `apps/main/src/globalValues.json` (R1) and/or 'apps/ra/src/globalValues.json' (RA)
 * 3. Update `configs/acx-ui/configmaps/base/configmap-acx-ui.yaml` (R1 only)
 * 4. Update `configs/acx-ui/configmaps/base/values-configmap-env-map-acx-ui.yaml` (R1 only)
 * 5. Update `tools/docker/nginx/globalValues.json.template` (R1) and/or `tools/docker/nginx/globalValues-ra.json.template` (RA)
 */
type R1Environment = {
  GOOGLE_MAPS_KEY: string
  DISABLE_PENDO: string
  CAPTIVE_PORTAL_DOMAIN_NAME: string
  CHANGE_PASSWORD: string
  MANAGE_LICENSES: string
  FETCHBOT_JS_URL: string
  DOCUMENTATION_CENTER: string
  MY_OPEN_CASES: string
  PRIVACY: string
  SUPPORTED_AP_MODELS: string
  HOW_TO_VIDEOS: string
  NEW_API_DOMAIN_NAME: string
  API_DOCUMENTATION_URL: string
  MIB_FILES: string
}

type RAEnvironment = {
  IS_MLISA_SA: string
  MLISA_REGION: string
  MLISA_VERSION: string
  MLISA_UI_USER_TRACKING: string
  DRUID_ROLLUP_DAYS: string
  ENABLED_FEATURES: string
}

type EnvironmentConfig = commonEnvironment & R1Environment & RAEnvironment

const config: { value?: EnvironmentConfig } = {}

export async function initialize (deployment: 'r1' | 'ra' | 'test') {
  const baseUrl = trimEnd(document.baseURI, '/')
  const envConfigUrl = `${baseUrl}/globalValues.json`
  const isTestDeployment = deployment === 'test'

  let requestConfig: RequestInit = {}
  if (deployment === 'r1') {
    requestConfig = { headers: { Authorization: `Bearer ${getJwtToken()}` } }
  }

  const response = await fetch(envConfigUrl, requestConfig)
  !isTestDeployment && userAuthFailedLogout(response)

  const jsonValue = await response.json()

  config.value = {
    ...jsonValue,
    ...{
      GOOGLE_MAPS_KEY: jsonValue.GOOGLE_MAPS,
      SPLIT_IO_KEY: jsonValue.SPLIT_IO,
      PENDO_API_KEY: jsonValue.PENDO_API
    }
  }
}

export function get (key: keyof EnvironmentConfig): string {
  if (key === 'IS_MLISA_SA') return process.env.NX_IS_MLISA_SA || ''
  if (config.value === undefined) throw new Error('Config not initialized')
  return config.value[key]
}


export function getJwtToken () {
  return sessionStorage.getItem('jwt') || null
}

export function userAuthFailedLogout (response: Response) {
  //Trigger a user logout and redirect them back to the login page following authorization fails,
  //clone the code from 'utils/user' since this file unable access 'utils/user'
  if(response.status !== 200){
    const token = sessionStorage.getItem('jwt')?? null
    sessionStorage.removeItem('jwt')
    sessionStorage.removeItem('ACX-ap-compatibiliy-note-hidden') // clear ap compatibiliy banner display condition
    window.location.href = token? `/logout?token=${token}` : '/logout'
  }
}
