import { getPolicyRoutePath, getServiceRoutePath } from '../features'

export const CONFIG_TEMPLATE_PATH_PREFIX = 'configTemplates'
export const CONFIG_TEMPLATE_LIST_PATH = `${CONFIG_TEMPLATE_PATH_PREFIX}/templates`
export const CONFIG_TEMPLATE_BUNDLE_LIST_PATH = `${CONFIG_TEMPLATE_PATH_PREFIX}/bundles`
export const CONFIG_TEMPLATE_TYPE_PARAM_NAME = 'configTemplateType'

export enum CONFIG_TEMPLATE_TYPE {
  VENUE = 'v',
  NETWORK = 'n',
  POLICY = 'p',
  SERVICE = 's'
}

export function convertToConfigTemplateTypeRoute (path: string) {
  return `:${CONFIG_TEMPLATE_TYPE_PARAM_NAME}/${path}`
}

export function getPolicyConfigTemplateRoute (...args: Parameters<typeof getPolicyRoutePath>) {
  return convertToConfigTemplateTypeRoute(getPolicyRoutePath(...args))
}

export function getPolicyConfigTemplateLink (...args: Parameters<typeof getPolicyRoutePath>) {
  // eslint-disable-next-line max-len
  return [CONFIG_TEMPLATE_PATH_PREFIX, CONFIG_TEMPLATE_TYPE.POLICY, getPolicyRoutePath(...args)].join('/')
}

export function getServiceConfigTemplateRoute (...args: Parameters<typeof getServiceRoutePath>) {
  return convertToConfigTemplateTypeRoute(getServiceRoutePath(...args))
}
export function getServiceConfigTemplateLink (...args: Parameters<typeof getServiceRoutePath>) {
  // eslint-disable-next-line max-len
  return [CONFIG_TEMPLATE_PATH_PREFIX, CONFIG_TEMPLATE_TYPE.SERVICE, getServiceRoutePath(...args)].join('/')
}

export function getNetworkConfigTemplateRoute (networkPath: string) {
  return convertToConfigTemplateTypeRoute(networkPath)
}
export function getNetworkConfigTemplateLink (networkPath: string) {
  return [CONFIG_TEMPLATE_PATH_PREFIX, CONFIG_TEMPLATE_TYPE.NETWORK, networkPath].join('/')
}

export function getVenueConfigTemplateRoute (venuePath: string) {
  return convertToConfigTemplateTypeRoute(venuePath)
}
export function getVenueConfigTemplateLink (venuePath: string) {
  return [CONFIG_TEMPLATE_PATH_PREFIX, CONFIG_TEMPLATE_TYPE.VENUE, venuePath].join('/')
}