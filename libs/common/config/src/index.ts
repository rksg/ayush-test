import { trimEnd } from 'lodash'

export interface EnvironmentConfig {
  GOOGLE_MAPS_KEY: string
  SPLIT_IO_KEY: string
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
