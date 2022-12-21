import { useIntl }  from 'react-intl'
import { showActionModal } from '@acx-ui/components'
import {
  useDeleteApMutation,
} from '@acx-ui/rc/services'
import {
  SwitchStatusEnum
} from '@acx-ui/rc/utils'

export function useSwitchActions () {
  const { $t } = useIntl()
  const [ deleteAp ] = useDeleteApMutation()

  function shouldHideConfirmation (selectedRows: any[]) {
    const noVerificationStatus = [SwitchStatusEnum.NEVER_CONTACTED_CLOUD, SwitchStatusEnum.DISCONNECTED];
    return selectedRows.every(record => {
      return noVerificationStatus.indexOf(record.deviceStatus) !== -1;
    })
  }

  const showDeleteSwitches = async ( rows: any[], tenantId?: string, callBack?: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Switches' }),
        entityValue: rows.length === 1 ? rows[0].name : undefined,
        numOfEntities: rows.length,
        confirmationText: !shouldHideConfirmation(rows) ? 'Delete' : undefined
      },
      onOk: () => { rows.length === 1 ?
        deleteAp({ params: { tenantId, venueId: rows[0].id } })
          .then(callBack) :
        deleteAp({ params: { tenantId }, payload: rows.map(item => item.id) })
          .then(callBack)
      }
    })
  }

  return {
    showDeleteSwitches
  }
}