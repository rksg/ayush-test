import { defineMessage } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { getIntl }         from '@acx-ui/utils'

const profileInUsedMessageForDelete = defineMessage({
  defaultMessage: `You are unable to delete {count, plural,
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
  if (hasAppliedInstanceList(selectedRows, instances)) {
    showActionModal({
      type: 'error',
      content: getDisabledDeleteMessage(selectedRows, instances)
    })
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

function hasAppliedInstanceList<T> (
  selectedRows: T[],
  instances: { fieldName: keyof T, fieldText: string }[]
): boolean {
  return instances.some(instance => hasAppliedInstance(selectedRows, instance.fieldName))
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

function getDisabledDeleteMessage<T> (
  selectedRows: T[],
  instances: { fieldName: keyof T, fieldText: string }[]
): string | undefined {
  const { $t } = getIntl()
  const result: string[] = []

  instances.forEach(instance => {
    if (hasAppliedInstance(selectedRows, instance.fieldName)) {
      result.push(instance.fieldText)
    }
  })

  return result.length > 0
    ? $t(profileInUsedMessageForDelete, {
      count: selectedRows.length,
      serviceName: result.join(',')
    })
    : undefined
}
