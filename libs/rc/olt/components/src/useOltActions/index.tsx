import { useIntl } from 'react-intl'

import { showActionModal } from '@acx-ui/components'
import { Olt }             from '@acx-ui/olt/utils'

type OltActionProps = {
  rows: Olt[],
  callBack?: () => void
}

export function useOltActions () {
  const { $t } = useIntl()

  const showDeleteOlt = async ({ rows, callBack }: OltActionProps) => {
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

  const showRebootOlt = async ({ rows, callBack }: OltActionProps) => {
    const oltName = rows.length === 1 ? rows[0].name : undefined
    const oltNum = rows.length
    showActionModal({
      type: 'confirm',
      title: oltNum === 1
        ? $t({ defaultMessage: 'Reboot the Chassis of "{name}"?' }, { name: oltName })
        : $t({ defaultMessage: 'Reboot the Chassis of "{num} OLT Chassis"?' }, { num: oltNum }),
      content: oltNum === 1
        ? $t({ defaultMessage: 'Are you sure you want to reboot this OLT chassis?' })
        : $t({ defaultMessage: 'Are you sure you want to reboot these OLT chassis?' }),
      okText: $t({ defaultMessage: 'Reboot Chassis' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: () => {
        //TODO
        callBack?.()
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showRebootLineCard = async ({ rows, callBack }: OltActionProps) => {
    //TODO
    callBack?.()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showRebootOnt = async ({ rows, callBack }: OltActionProps) => {
    //TODO
    callBack?.()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const doSyncData = async ({ rows, callBack }: OltActionProps) => {
    //TODO
    callBack?.()
  }

  return {
    showDeleteOlt,
    showRebootOlt,
    showRebootLineCard,
    showRebootOnt,
    doSyncData
  }
}
