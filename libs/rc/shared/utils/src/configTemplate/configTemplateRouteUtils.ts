import { useTenantLink } from '@acx-ui/react-router-dom'

import { PolicyOperation, getPolicyDetailsLink } from '../features'
import { ConfigTemplateType }                    from '../types'

import { configTemplatePolicyTypeMap } from './contentsMap'

export const CONFIG_TEMPLATE_PATH_PREFIX = 'configTemplates'

export function getConfigTemplatePath (path = ''): string {
  const trimmedPath = path.replace(/^\//, '') // Remove leading slash if present

  return trimmedPath
    ? `${CONFIG_TEMPLATE_PATH_PREFIX}/${trimmedPath}`
    : CONFIG_TEMPLATE_PATH_PREFIX
}

export const CONFIG_TEMPLATE_LIST_PATH = getConfigTemplatePath('templates')
export const CONFIG_TEMPLATE_BUNDLE_LIST_PATH = getConfigTemplatePath('bundles')

export function getConfigTemplateEditPath (type: ConfigTemplateType, id: string): string {
  const policyType = configTemplatePolicyTypeMap[type]
  let path

  if (policyType) {
    path = getPolicyDetailsLink({ type: policyType, oper: PolicyOperation.EDIT, policyId: id })
  } else if (type === ConfigTemplateType.NETWORK) {
    path = `networks/wireless/${id}/edit`
  } else if (type === ConfigTemplateType.VENUE) {
    path = `venues/${id}/edit/details`
  }

  return getConfigTemplatePath(path)
}

export function useConfigTemplateTenantLink (to: string) {
  return useTenantLink(getConfigTemplatePath(to), 'v')
}
