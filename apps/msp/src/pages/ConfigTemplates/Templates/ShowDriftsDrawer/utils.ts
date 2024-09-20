import { TemplateInstanceDriftPair, TemplateInstanceDriftRecord, TemplateInstanceDriftResponse, TemplateInstanceDriftValue } from '@acx-ui/rc/utils'

import { DriftComparisonData }    from './DriftComparison'
import { DriftComparisonSetData } from './DriftComparisonSet'
// eslint-disable-next-line max-len
export function transformDriftResponse (data: TemplateInstanceDriftResponse): DriftComparisonSetData[] {
  return Object.entries(data).map(([ category, items ]) => ({
    category,
    driftItems: convertDriftRecord(items)
  }))
}

function convertDriftRecord (record: TemplateInstanceDriftRecord): DriftComparisonData[] {
  return Object.entries(record)
    .filter(([ name, values ]) => filterDriftRecord(name, values))
    .map(([ name, values ]) => ({ name: convertDriftName(name), values }))
}

function filterDriftRecord (name: string, values: TemplateInstanceDriftPair): boolean {
  if (!name.toLowerCase().endsWith('id')) return true
  return !isUuidValue(values.template) && !isUuidValue(values.instance)
}

function isUuidValue (value: TemplateInstanceDriftValue): boolean {
  return /^[0-9a-fA-F]{32}$/.test((value ?? '').toString())
}

function convertDriftName (name: string): string {
  if (name.toLowerCase().endsWith('idname')) return '/name'

  return name
}
