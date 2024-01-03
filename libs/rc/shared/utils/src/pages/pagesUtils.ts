import { getIntl } from '@acx-ui/utils'

// eslint-disable-next-line max-len
export function generatePageHeaderTitle (isEdit: boolean, isTemplate: boolean, instanceLabel: string): string {
  const { $t } = getIntl()

  return $t({ defaultMessage: '{action} {instanceLabel} {templateText}' }, {
    action: isEdit ? $t({ defaultMessage: 'Edit' }) : $t({ defaultMessage: 'Add' }),
    instanceLabel,
    templateText: isTemplate ? $t({ defaultMessage: 'Template' }) : ''
  })
}
