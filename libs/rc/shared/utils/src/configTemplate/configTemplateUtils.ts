import { TenantType } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

export const CONFIG_TEMPLATE_LIST_PATH = 'configTemplates/templates'
export const CONFIG_TEMPLATE_BUNDLE_LIST_PATH = 'configTemplates/bundles'

// eslint-disable-next-line max-len
export function generateConfigTemplateBreadcrumb (): { text: string, link?: string, tenantType?: TenantType }[] {
  const { $t } = getIntl()

  return [
    {
      text: $t({ defaultMessage: 'Configuration Templates' }),
      link: CONFIG_TEMPLATE_LIST_PATH,
      tenantType: 'v'
    }
  ]
}
