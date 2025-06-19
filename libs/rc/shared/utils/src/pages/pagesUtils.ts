import { useMemo } from 'react'

import { TenantType } from '@acx-ui/react-router-dom'
import { getIntl }    from '@acx-ui/utils'

import { generateConfigTemplateBreadcrumb, useConfigTemplate } from '../configTemplate'

interface TitleGenerationProps {
  isEdit: boolean
  isTemplate: boolean
  instanceLabel: string
  addLabel?: string
}

export function generatePageHeaderTitle (props: TitleGenerationProps): string {
  const { $t } = getIntl()
  const { isEdit, isTemplate, instanceLabel, addLabel = $t({ defaultMessage: 'Add' }) } = props
  const actionLabel = isEdit ? $t({ defaultMessage: 'Edit' }) : addLabel
  const templateLabel = isTemplate ? $t({ defaultMessage: 'Template' }) : ''

  return $t({ defaultMessage: '{action} {instanceLabel} {templateText}' }, {
    action: actionLabel,
    instanceLabel,
    templateText: templateLabel
  })
}

// eslint-disable-next-line max-len
export function useConfigTemplateBreadcrumb (fallbackPath: { text: string, link?: string, tenantType?: TenantType }[]) {
  const { isTemplate, templateContext } = useConfigTemplate()
  const breadcrumb = useMemo(() => {
    return isTemplate
      ? generateConfigTemplateBreadcrumb(templateContext)
      : fallbackPath
  }, [isTemplate])

  return breadcrumb
}

// eslint-disable-next-line max-len
export function useConfigTemplatePageHeaderTitle (props: Omit<TitleGenerationProps, 'isTemplate'>) {
  const { isTemplate } = useConfigTemplate()
  return generatePageHeaderTitle({ ...props, isTemplate })
}
