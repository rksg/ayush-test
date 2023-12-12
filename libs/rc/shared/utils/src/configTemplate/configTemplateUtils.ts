import { TenantType }           from '@acx-ui/react-router-dom'
import { RolesEnum }            from '@acx-ui/types'
import { hasRoles }             from '@acx-ui/user'
import { AccountType, getIntl } from '@acx-ui/utils'

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

export function hasConfigTemplateAccess (featureFlagEnabled:boolean, accountType: string): boolean {
  return featureFlagEnabled
    && hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
    && (accountType === AccountType.MSP || accountType === AccountType.MSP_NON_VAR)
}
