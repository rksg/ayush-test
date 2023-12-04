import { TenantType } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

// eslint-disable-next-line max-len
export function generateConfigTemplateBreadcrumb (): { text: string, link?: string, tenantType?: TenantType }[] {
  const { $t } = getIntl()

  return [
    {
      text: $t({ defaultMessage: 'Configuration Templates' }),
      link: 'configTemplates/templates',
      tenantType: 'v'
    }
  ]
}

export function generateConfigTemplatePayload (payload: object) {
  return { ...payload, isTemplate: true }
}
