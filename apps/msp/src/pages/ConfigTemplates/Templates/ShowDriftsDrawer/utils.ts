import { ConfigTemplateDriftPair, ConfigTemplateDriftValueType } from '@acx-ui/rc/utils'

export function filterDriftRecord (name: string, values: ConfigTemplateDriftPair): boolean {
  if (name.toLowerCase().endsWith('id')) {
    return !isUuidValue(values.template) && !isUuidValue(values.instance)
  }

  return true
}

function isUuidValue (value: ConfigTemplateDriftValueType): boolean {
  return /^[0-9a-fA-F]{32}$/.test((value ?? '').toString())
}

export function convertDriftName (name: string): string {
  if (name.toLowerCase().endsWith('idname')) return '/name'

  return name
}
