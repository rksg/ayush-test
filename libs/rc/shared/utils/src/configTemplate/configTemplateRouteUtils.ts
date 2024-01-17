import { PolicyOperation, getPolicyDetailsLink } from '../features'
import { ConfigTemplateType }                    from '../types'

import { configTemplatePolicyTypeMap } from './contentsMap'

export function getConfigTemplatePath (path?: string) {
  return path
    ? `${CONFIG_TEMPLATE_PATH_PREFIX}/${path}`
    : CONFIG_TEMPLATE_PATH_PREFIX
}

export const CONFIG_TEMPLATE_PATH_PREFIX = 'configTemplates'
export const CONFIG_TEMPLATE_LIST_PATH = getConfigTemplatePath('templates')
export const CONFIG_TEMPLATE_BUNDLE_LIST_PATH = getConfigTemplatePath('bundles')


export function getConfigTemplateEditPath (type: ConfigTemplateType, id: string): string {
  const policyType = configTemplatePolicyTypeMap[type]
  let path

  if (policyType) {
    path = getPolicyDetailsLink({ type: policyType, oper: PolicyOperation.EDIT, policyId: id })
  } else if (type === ConfigTemplateType.NETWORK) {
    path = `networks/wireless/${id}/edit`
  }

  return getConfigTemplatePath(path)
}
