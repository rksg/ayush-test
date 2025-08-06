import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Olt }             from '@acx-ui/olt/utils'

export function useOltActions () {
  const { $t } = useIntl()

  const showDeleteOltes = async ({ rows, callBack }: {
    rows: Olt[],
    callBack?: () => void
  }) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: rows.length === 1
          ? $t({ defaultMessage: 'OLT Device' })
          : $t({ defaultMessage: 'OLT Devices' }),
        entityValue: rows.length === 1 ? rows[0].name : undefined,
        numOfEntities: rows.length
      },
      onOk: () => {
        //TODO
        callBack?.()
      }
    })
  }

  const showRebootOlt = async ({ rows, callBack }: {
    rows: Olt[],
    callBack?: () => void
  }) => {
    showActionModal({
      type: 'confirm',
      title: rows.length === 1
        ? $t({ defaultMessage: 'Reboot "{name}"?' }, { name: rows[0].name })
        : $t({ defaultMessage: 'Reboot "{num} OLT Devices"?' }, { num: rows.length }),
      content: rows.length === 1
        ? $t({ defaultMessage: 'Are you sure you want to reboot this OLT device?' })
        : $t({ defaultMessage: 'Are you sure you want to reboot these OLT devices?' }),
      okText: $t({ defaultMessage: 'Reboot' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: () => {
        //TODO
        callBack?.()
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const doSyncData = async ({ rows, callBack }: {
    rows: Olt[],
    callBack?: () => void
  }) => {
  }

  return {
    showDeleteOltes,
    showRebootOlt,
    doSyncData
  }
}
