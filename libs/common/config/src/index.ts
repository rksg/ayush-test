import { trimEnd } from 'lodash'

/**
 * Steps to add new env var
 * 1. Define new env var in the `EnvironmentConfig` below
 * 2. Update `apps/main/src/env.json`
 * 3. Update `configs/acx-ui/configmaps/base/configmap-acx-ui.yaml`
 * 4. Update `configs/acx-ui/configmaps/base/values-configmap-env-map-acx-ui.yaml`
 * 5. Update `tools/docker/nginx/env.json.template`
 */

export interface EnvironmentConfig {
  GOOGLE_MAPS_KEY: string
  SPLIT_IO_KEY: string
  PENDO_API_KEY: string
  DISABLE_PENDO: string
}

const config: { value?: EnvironmentConfig } = {}

export async function initialize () {
  const baseUrl = trimEnd(document.baseURI, '/')
  const envConfigUrl = `${baseUrl}/env.json`
  config.value = await fetch(envConfigUrl).then(res => res.json())
}

export function get (key: keyof EnvironmentConfig) {
  if (config.value === undefined) throw new Error('Config not initialized')
  return config.value[key]
}

export * from './kpiDefaultThresholds'
