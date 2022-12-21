/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { showActionModal }    from '@acx-ui/components'
import {
  useDeleteSwitchesMutation
} from '@acx-ui/rc/services'
import {
  getSwitchName,
  SwitchStatusEnum
} from '@acx-ui/rc/utils'

export function useSwitchActions () {
  const { $t } = useIntl()
  const [ deleteSwitches ] = useDeleteSwitchesMutation()

  function shouldHideConfirmation (selectedRows: any[]) {
    const noVerificationStatus = [SwitchStatusEnum.NEVER_CONTACTED_CLOUD, SwitchStatusEnum.DISCONNECTED]
    return selectedRows.every(record => {
      return noVerificationStatus.indexOf(record.deviceStatus) !== -1
    })
  }

  const showDeleteSwitches = async ( rows: any[], tenantId?: string, callBack?: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: rows.length === 1 ? $t({ defaultMessage: 'Switch' }) : $t({ defaultMessage: 'Switches' }),
        entityValue: rows.length === 1 ? getSwitchName(rows[0]) : undefined,
        numOfEntities: rows.length,
        confirmationText: !shouldHideConfirmation(rows) ? 'Delete' : undefined
      },
      onOk: () => {
        const switchIdList = rows.map(item => item.id || item.serialNumber)
        deleteSwitches({ params: { tenantId }, payload: switchIdList })
          .then(callBack)
      }
    })
  }

  return {
    showDeleteSwitches
  }
}