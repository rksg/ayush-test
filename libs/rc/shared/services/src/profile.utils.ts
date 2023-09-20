import { defineMessage } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { getIntl }         from '@acx-ui/utils'

const profileInUsedMessage = defineMessage({
  defaultMessage: `You are unable to {action} {count, plural,
  one {this record}
  other {these records}
  } due to its usage in {serviceName}`
})

export function doProfileDelete<T> (
  selectedRows: T[],
  entityName: string,
  entityValue: string | undefined,
  instances: { fieldName: keyof T, fieldText: string }[],
  callback: () => Promise<void>
) {
  // eslint-disable-next-line max-len
  const disabledActionMessage = getDisabledActionMessage(selectedRows, instances, getIntl().$t({ defaultMessage: 'delete' }))
  if (disabledActionMessage) {
    showAppliedInstanceMessage(disabledActionMessage)
  } else {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: entityName,
        entityValue: entityValue,
        numOfEntities: selectedRows.length
      },
      onOk: callback
    })
  }
}

export function showAppliedInstanceMessage (content: string) {
  showActionModal({ type: 'error', content })
}

function hasAppliedInstance<T> (
  selectedRows: T[],
  fieldName: keyof T
): boolean {
  return selectedRows.some(row => {
    const value = row[fieldName]
    if (value && Array.isArray(value)) return value.length > 0
    return !!value
  })
}

export function getDisabledActionMessage<T> (
  selectedRows: T[],
  instances: { fieldName: keyof T, fieldText: string }[],
  action: string
): string | undefined {
  const { $t } = getIntl()
  const result: string[] = []

  instances.forEach(instance => {
    if (hasAppliedInstance(selectedRows, instance.fieldName)) {
      result.push(instance.fieldText)
    }
  })

  return result.length > 0
    ? $t(profileInUsedMessage, {
      action,
      count: selectedRows.length,
      serviceName: result.join(',')
    })
    : undefined
}
