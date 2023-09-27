import { trimEnd } from 'lodash'

type commonEnvironment = {
  SPLIT_IO_KEY: string
  PENDO_API_KEY: string
  STATIC_ASSETS: string
  SPLIT_PROXY_ENDPOINT: string
}

/**
 * Steps to add new env var
 * 1. Define new env var in the `R1Environment` below
 * 2. Update `apps/main/src/env.json`
 * 3. Update `configs/acx-ui/configmaps/base/configmap-acx-ui.yaml`
 * 4. Update `configs/acx-ui/configmaps/base/values-configmap-env-map-acx-ui.yaml`
 * 5. Update `tools/docker/nginx/env.json.template`
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
}

type RAEnvironment = {
  IS_MLISA_SA: string
  MLISA_REGION: string
  MLISA_VERSION: string
  MLISA_DOCUMENTATION_URL: string
  MLISA_UI_USER_TRACKING: string
  DRUID_ROLLUP_DAYS: string
}

type EnvironmentConfig = commonEnvironment & R1Environment & RAEnvironment

const config: { value?: EnvironmentConfig } = {}

export async function initialize () {
  const baseUrl = trimEnd(document.baseURI, '/')
  const envConfigUrl = `${baseUrl}/env.json`
  config.value = await fetch(envConfigUrl).then(res => res.json())
}

export function get (key: keyof EnvironmentConfig): string {
  if (key === 'IS_MLISA_SA') return process.env.NX_IS_MLISA_SA || ''
  if (config.value === undefined) throw new Error('Config not initialized')
  return config.value[key]
}
