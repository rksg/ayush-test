/* eslint-disable max-len */
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { showActionModal }              from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useDeleteSwitchesMutation,
  useRebootSwitchMutation,
  useSyncDataMutation,
  useSyncSwitchesDataMutation,
  useRetryFirmwareUpdateMutation,
  useRetryFirmwareUpdateV1001Mutation
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
  const rbacApiToggle = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [ deleteSwitches ] = useDeleteSwitchesMutation()
  const [ rebootSwitch ] = useRebootSwitchMutation()
  const [ syncData ] = useSyncDataMutation()
  const [ syncSwitchesData ] = useSyncSwitchesDataMutation()
  const [ retryFirmwareUpdate ] = useRetryFirmwareUpdateMutation()
  const [ retryFirmwareUpdateV1002 ] = useRetryFirmwareUpdateV1001Mutation()

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
      onOk: async () => {
        if (rbacApiToggle) {
          try {
            const groups = _.groupBy(rows, 'venueId')
            const requests = Object.keys(groups).map(key => ({ params: { venueId: key }, payload: groups[key].map(item => item.id || item.serialNumber) }))

            const requestList = requests.map((requests) => {
              return deleteSwitches({
                params: requests.params,
                payload: requests.payload,
                enableRbac: true
              }).unwrap()
            })
            await Promise.all(requestList).then(callBack)
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error)
          }

        } else {
          const switchIdList = rows.map(item => item.id || item.serialNumber)
          deleteSwitches({ params: { tenantId }, payload: switchIdList })
            .then(callBack)
        }

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
        if (rbacApiToggle) {
          deleteSwitches({
            params: { tenantId, venueId: data.venueId },
            payload: switchIdList,
            enableRbac: true
          }).then(callBack)
        } else {
          deleteSwitches({
            params: { tenantId },
            payload: switchIdList,
            enableRbac: false
          }).then(callBack)

        }

      }
    })
  }

  const showRebootSwitch = (switchId: string, venueId: string, tenantId: string, isStack: boolean ) => {
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
                params: { tenantId: tenantId, switchId, venueId },
                payload: { deviceRequestAction: DeviceRequestAction.REBOOT },
                enableRbac: rbacApiToggle
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

  const doSyncData = async (switchId: string, venueId: string, tenantId: string, callBack?: () => void) => {
    try {
      await syncData({
        params: { tenantId, switchId, venueId },
        payload: { deviceRequestAction: DeviceRequestAction.SYNC, isManual: true },
        enableRbac: rbacApiToggle
      }).unwrap()
      setTimeout(() => {
        callBack && callBack()
      }, 3000)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const doSyncAdminPassword = async ( rows: SwitchRow[], callBack?: () => void) => {
    if (rbacApiToggle) {
      try {
        const groups = _.groupBy(rows, 'venueId')
        const requests = Object.keys(groups).map(key => ({
          params: { venueId: key }, payload: {
            deviceRequestAction: DeviceRequestAction.SYNC_ADMIN_PASSWORD,
            switchIdList: groups[key].map(item => item.id || item.serialNumber)
          }
        }))

        const requestList = requests.map((requests) => {
          return syncSwitchesData({
            params: requests.params,
            payload: requests.payload,
            enableRbac: true
          }).unwrap()
        })

        await Promise.all(requestList)
        setTimeout(() => {
          callBack?.()
        }, 1000)

      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }

    } else {
      const switchIdList = rows.map(row => row.id)
      try {
        await syncSwitchesData({
          payload: {
            deviceRequestAction: DeviceRequestAction.SYNC_ADMIN_PASSWORD,
            switchIdList
          },
          enableRbac: false
        }).unwrap()
        setTimeout(() => {
          callBack?.()
        }, 1000)
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
      }
    }

  }

  const doRetryFirmwareUpdate = async (
    params: {
      switchId: string,
      tenantId?: string,
      venueId?: string
    }, callBack?: () => void) => {
    try {
      await retryFirmwareUpdate({
        params,
        enableRbac: rbacApiToggle,
        payload: {}
      }).unwrap()
      setTimeout(() => {
        callBack?.()
      }, 1000)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }


  const doRetryFirmwareUpdateV1002 = async (
    params: {
      switchId: string,
      tenantId?: string,
      venueId?: string
    }, callBack?: () => void) => {
    try {
      await retryFirmwareUpdateV1002({
        params
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
    doSyncAdminPassword,
    doRetryFirmwareUpdate,
    doRetryFirmwareUpdateV1002
  }
}
