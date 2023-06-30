/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { showActionModal }         from '@acx-ui/components'
import {
  useDeleteSwitchesMutation,
  useRebootSwitchMutation,
  useSyncDataMutation,
  useRetryFirmwareUpdateMutation
} from '@acx-ui/rc/services'
import {
  DeviceRequestAction,
  getSwitchName,
  SwitchRow,
  SwitchStatusEnum,
  SwitchViewModel
} from '@acx-ui/rc/utils'

export function useSwitchActions () {
  const { $t } = useIntl()
  const [ deleteSwitches ] = useDeleteSwitchesMutation()
  const [ rebootSwitch ] = useRebootSwitchMutation()
  const [ syncData ] = useSyncDataMutation()
  const [ retryFirmwareUpdate ] = useRetryFirmwareUpdateMutation()

  function shouldHideConfirmation (selectedRows: SwitchRow[]) {
    const noVerificationStatus = [SwitchStatusEnum.NEVER_CONTACTED_CLOUD, SwitchStatusEnum.DISCONNECTED]
    return selectedRows.every(record => {
      return noVerificationStatus.indexOf(record.deviceStatus) !== -1
    })
  }

  const showDeleteSwitches = async ( rows: SwitchRow[], tenantId?: string, callBack?: ()=>void ) => {
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


  const showDeleteSwitch = async ( data: SwitchViewModel, tenantId?: string, callBack?: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Switch' }),
        entityValue: data.name || data.serialNumber,
        numOfEntities: 1
      },
      onOk: () => {
        const switchIdList = [data.serialNumber]
        deleteSwitches({ params: { tenantId }, payload: switchIdList })
          .then(callBack)
      }
    })
  }

  const showRebootSwitch = (switchId: string, tenantId: string, isStack: boolean ) => {
    const deviceType = isStack ? $t({ defaultMessage: 'Stack' }) : $t({ defaultMessage: 'Switch' })
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Cancel' }),
          type: 'default',
          key: 'cancel'
        }, {
          text: $t({ defaultMessage: 'Reboot' }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler: async () => {
            try {
              await rebootSwitch({
                params: { tenantId: tenantId, switchId },
                payload: { deviceRequestAction: DeviceRequestAction.REBOOT }
              }).unwrap()
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            }
          }
        }]
      },
      title: $t({ defaultMessage: 'Reboot {deviceType}?' }, { deviceType }),
      content: $t({ defaultMessage: 'Rebooting the {deviceType} will disconnect all connected clients. Are you sure you want to reboot?' }, { deviceType })
    })
  }

  const doSyncData= async (switchId: string, tenantId: string, callBack?: ()=>void ) => {
    try {
      await syncData({
        params: { tenantId: tenantId, switchId },
        payload: { deviceRequestAction: DeviceRequestAction.SYNC, isManual: true }
      }).unwrap()
      setTimeout(() => {
        callBack && callBack()
      }, 3000)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const doRetryFirmwareUpdate= async (switchId: string, tenantId?: string, callBack?: ()=>void ) => {
    try {
      await retryFirmwareUpdate({
        params: { tenantId, switchId },
        payload: {}
      }).unwrap()
      setTimeout(() => {
        callBack?.()
      }, 1000)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return {
    showDeleteSwitches,
    showDeleteSwitch,
    showRebootSwitch,
    doSyncData,
    doRetryFirmwareUpdate
  }
}
