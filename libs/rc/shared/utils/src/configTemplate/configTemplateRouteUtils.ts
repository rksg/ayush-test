export const CONFIG_TEMPLATE_PATH_PREFIX = 'configTemplates'
export const CONFIG_TEMPLATE_LIST_PATH = `${CONFIG_TEMPLATE_PATH_PREFIX}/templates`
export const CONFIG_TEMPLATE_BUNDLE_LIST_PATH = `${CONFIG_TEMPLATE_PATH_PREFIX}/bundles`

export function getConfigTemplateLink (path: string) {
  return `${CONFIG_TEMPLATE_PATH_PREFIX}/${path}`
}
