import { useTenantLink } from '@acx-ui/react-router-dom'

import { ServiceOperation }                            from '../constants'
import { getPolicyDetailsLink, getServiceDetailsLink } from '../features'
import { ConfigTemplateType, PolicyOperation }         from '../types'

import { configTemplatePolicyTypeMap, configTemplateServiceTypeMap } from './contentsMap'

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
  const serviceType = configTemplateServiceTypeMap[type]
  let path

  if (policyType) {
    path = getPolicyDetailsLink({ type: policyType, oper: PolicyOperation.EDIT, policyId: id })
  } else if (serviceType) {
    path = getServiceDetailsLink({ type: serviceType, oper: ServiceOperation.EDIT, serviceId: id })
  } else if (type === ConfigTemplateType.NETWORK) {
    path = `networks/wireless/${id}/edit`
  } else if (type === ConfigTemplateType.VENUE) {
    path = `venues/${id}/edit/details`
  } else if (type === ConfigTemplateType.SWITCH_REGULAR) {
    path = `networks/wired/profiles/regular/${id}/edit`
  } else if (type === ConfigTemplateType.SWITCH_CLI) {
    path = `networks/wired/profiles/cli/${id}/edit`
  } else if (type === ConfigTemplateType.AP_GROUP) {
    path = `devices/apgroups/${id}/edit/general`
  }

  return getConfigTemplatePath(path)
}

export function useConfigTemplateTenantLink (to: string) {
  return useTenantLink(getConfigTemplatePath(to), 'v')
}
