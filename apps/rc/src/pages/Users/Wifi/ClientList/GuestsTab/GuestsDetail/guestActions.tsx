import { Form, Input, Modal, Radio }           from 'antd'
import { IntlShape, RawIntlProvider, useIntl } from 'react-intl'

import { cssStr, showActionModal, showToast } from '@acx-ui/components'
import {
  useGetGuestsMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation,

  useDeleteGuestsMutation
} from '@acx-ui/rc/services'
import {
  Guest
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'
import moment from 'moment'
import saveAs from 'file-saver'



export function useGuestActions () {
  const { $t } = useIntl()
  // const [ downloadApLog ] = useDownloadApLogMutation()
  const[ getGuests ] = useGetGuestsMutation()
  // const [ rebootAp ] = useRebootApMutation()
  const [deleteGuests] = useDeleteGuestsMutation()
  const [enableGuests] = useEnableGuestsMutation()
  const [disableGuests] = useDisableGuestsMutation()


  // const showRebootAp = (
  //   serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {
  //   showActionModal({
  //     type: 'confirm',
  //     customContent: {
  //       action: 'CUSTOM_BUTTONS',
  //       buttons: [{
  //         text: $t({ defaultMessage: 'Cancel' }),
  //         type: 'default',
  //         key: 'cancel'
  //       }, {
  //         text: $t({ defaultMessage: 'Reboot' }),
  //         type: 'primary',
  //         key: 'ok',
  //         closeAfterAction: true,
  //         handler: () => {
  //           rebootAp({ params: { tenantId: tenantId, serialNumber } })
  //           callBack && callBack()
  //         }
  //       }]
  //     },
  //     title: $t({ defaultMessage: 'Reboot Access Point?' }),
  //     content: $t({ defaultMessage: `Rebooting the AP will disconnect all connected clients.
  //       Are you sure you want to reboot?` })
  //   })
  // }


  const showDownloadInformation = (guest: Guest, tenantId?: string) => {
    const dateFormat = 'yyyy/MM/dd HH:mm' //TODO: Wait for User profile
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const guestIds = [guest.id]


    getGuests({ params: { tenantId }, payload: { dateFormat, timezone, guestIds } })
      .unwrap().then((result) => {
        let fileName = result
        // .headers.get('content-disposition');
        // fileName = fileName.split('filename=')[1];
        // fileName = fileName.substring(1, fileName.length - 1);
        // const timeString = moment().format('DDMMYYYY-HHmm')
        // saveAs(result.fileURL, `Guests Information ${'test'}.log.gz`) //TODO: CORS policy

        // const url = window.URL.createObjectURL(new Blob([fileName.data]))
        // const link = document.createElement('a')
        // link.href = url
        // link.setAttribute('download', 'test.csv')
        // document.body.appendChild(link)
        // link.click()
      })
      .catch(() => {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'Failed to download Information.' })
        })
      })
  }

  const showDeleteGuest = async (guest: Guest, tenantId?: string, callBack?: ()=>void) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Guest' }),
        entityValue: guest.name,
        numOfEntities: 1
      },
      onOk: () => {
        deleteGuests({ params: { tenantId }, payload: [guest.id] }).then(
          callBack
        )
      }
    })
  }

  const disableGuest = async (guest: Guest, tenantId?: string) => {
    disableGuests({ params: { tenantId, guestId: guest.id } })
  }

  const enableGuest = async (guest: Guest, tenantId?: string) => {
    enableGuests({ params: { tenantId, guestId: guest.id } })
  }

  // const showDeleteGuest = async ( serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {
  //   const payload = {
  //     entityType: 'apsList',
  //     fields: ['serialNumber', 'name', 'deviceStatus', 'fwVersion'],
  //     filters: {
  //       serialNumber: [serialNumber]
  //     },
  //     pageSize: 1
  //   }
  //   const apList = await getApList({
  //     params: { tenantId }, payload
  //   }, true).unwrap()
  //   showDeleteAps(apList.data, tenantId, callBack)
  // }

  // const showDeleteAps = async ( rows: AP[], tenantId?: string, callBack?: ()=>void ) => {
  //   const dhcpAps = await getDhcpAp({
  //     params: { tenantId: tenantId },
  //     payload: rows.map(row => row.serialNumber)
  //   }, true).unwrap()

  //   if (hasDhcpAps(dhcpAps)) {
  //     showActionModal({
  //       type: 'warning',
  //       content: $t({ defaultMessage: 'Not allow to delete DHCP APs' })
  //     })
  //     return
  //   }

  //   genDeleteModal(rows, deleteSoloFlag, (resetType) => {
  //     const deleteApApi = resetType === 'solo' ? deleteSoloAp : deleteAp
  //     rows.length === 1 ?
  //       deleteApApi({ params: { tenantId: tenantId, serialNumber: rows[0].serialNumber } })
  //         .then(callBack) :
  //       deleteApApi({
  //         params: { tenantId },
  //         payload: rows.map(row => row.serialNumber)
  //       }).then(callBack)
  //   })
  // }

  // const showBlinkLedAp = ( serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {
  //   blinkLedAp({ params: { tenantId, serialNumber } }).unwrap().then(() => {
  //     let count = blinkLedCount
  //     const interval = setInterval(() => {
  //       if (count <= 0) {
  //         clearInterval(interval)
  //         callBack && callBack()
  //       } else {
  //         genBlinkLedToast(count--, interval)
  //       }
  //     }, 1000)
  //   })
  // }

  return {
    // showDeleteAp,
    // showDeleteAps,
    // showDownloadApLog,
    // showRebootAp,
    // showBlinkLedAp,
    showDownloadInformation,
    disableGuest,
    enableGuest,
    showDeleteGuest
  }
}

// const hasContactedAp = (selectedRows: AP[]) => {
//   return !selectedRows.every(selectedAp =>
//     selectedAp.deviceStatus === ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD ||
//     selectedAp.deviceStatus === ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD)
// }
// const allOperationalAp = (selectedRows: AP[]) => {
//   return selectedRows.every(ap =>
//     ap.deviceStatus === ApDeviceStatusEnum.OPERATIONAL
//   )
// }
// const hasInvaildAp = (selectedRows: AP[]) => {
//   return !selectedRows.every(ap => {
//     if (ap.fwVersion === undefined) {
//       return true
//     }
//     else {
//       return ap.fwVersion.localeCompare('6.2.0.103.486',
//         undefined, { numeric: true, sensitivity: 'base' }) >= 0
//     }
//   })
// }

// const hasDhcpAps = (dhcpAps: CommonResult) => {
//   if (dhcpAps && dhcpAps.response) {
//     const res: DhcpApInfo[] = Array.isArray(dhcpAps.response)? dhcpAps.response : []
//     const dhcpApMap = res.filter(dhcpAp =>
//       dhcpAp.venueDhcpEnabled === true &&
//       (dhcpAp.dhcpApRole === ApDhcpRoleEnum.PrimaryServer ||
//         dhcpAp.dhcpApRole === ApDhcpRoleEnum.BackupServer))

//     return dhcpApMap.length > 0
//   }
//   return false
// }

// const genDeleteModal = (
//   rows: AP[],
//   deleteSoloFlag: boolean,
//   okHandler: (resetType: string) => void
// ) => {
//   const { $t } = getIntl()

//   const showResetFirmwareOption = allOperationalAp(rows) && !hasInvaildAp(rows)
//   const invalidAp = allOperationalAp(rows) && hasInvaildAp(rows)
//   const hideConfirmation = !hasContactedAp(rows)

//   const entityValue = rows.length === 1 ? rows[0].name : undefined
//   const modal = Modal.confirm({})

//   const title = $t({
//     defaultMessage: `Delete {count, plural,
//       one {"{entityValue}"}
//       other {{count} APs}
//     }?`
//   }, { count: rows.length, entityValue })

//   const confirmText = 'Delete'
//   let resetType = 'cloud'

//   const content = (<Form layout='vertical'>
//     <Form.Item>{$t({
//       defaultMessage: `Are you sure you want to delete {count, plural,
//         one {this AP}
//         other {these APs}
//       } ?`
//     }, { count: rows.length })}</Form.Item >

//     {hideConfirmation && <Form.Item>{$t({ defaultMessage: `
//       You are deleting one or more offline APs.
//       When these offline devices come back online
//       their configuration will be factory reset and they will be removed from Ruckus Cloud.`
//     })}</Form.Item >}

//     {!showResetFirmwareOption && !hideConfirmation && <Form.Item>{$t({
//       defaultMessage: `Once deleted, the AP will factory reset to Cloud ready.
//       The existing configuration will be wiped, AP firmware will remain Cloud-only firmware.
//       AP will be ready to re-connect to the Cloud.`
//     })}</Form.Item >}

//     {invalidAp && <Form.Item>{$t({
//       defaultMessage: `
//       The AP's firmware does not support resetting them to standalone AP.`
//     })}</Form.Item >}

//     {showResetFirmwareOption && <Form.Item
//       label={$t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: confirmText })}>
//       <Input onChange={(e) => {
//         const disabled = e.target.value.toLowerCase() !== confirmText.toLowerCase()
//         modal.update({
//           okButtonProps: { disabled }
//         })
//       }} />
//     </Form.Item>}

//     {deleteSoloFlag && showResetFirmwareOption && <Form.Item
//       label={$t({ defaultMessage: 'Select what should happen to the APs’ configuration:' })}>
//       <Radio.Group defaultValue={'cloud'} onChange={(e) => {resetType = e.target.value}}>
//         <Radio value='cloud'>
//           {$t({ defaultMessage: 'Factory reset to Cloud ready' })}
//           <div>{$t({ defaultMessage: `
//           Existing configuration will be wiped,
//           AP firmware will remain Cloud-only firmware.
//           AP will be ready to re-connect to the Cloud.` })}
//           </div>
//         </Radio>
//         <Radio value='solo'>
//           {$t({ defaultMessage: 'Factory reset to standalone firmware' })}
//           <div>{$t({ defaultMessage: `
//           Existing configuration will be wiped,
//           AP firmware will be modified to standalone image.
//           AP will be ready to connect to any controller or operate standalone.
//           Please note that this option will download and update your AP firmware,
//           which will take longer.` })}
//           </div>
//         </Radio>
//       </Radio.Group>
//     </Form.Item>}
//   </Form>)

//   const config = {
//     icon: <> </>,
//     title: title,
//     content: content,
//     cancelText: $t({ defaultMessage: 'Cancel' }),
//     okText: $t({ defaultMessage: 'Delete' }),
//     okButtonProps: { disabled: showResetFirmwareOption },
//     onOk: () => {okHandler(resetType)}
//   }
//   modal.update({
//     ...config,
//     content: <RawIntlProvider value={getIntl()} children={config.content} />
//   })

//   return modal
// }

// const genBlinkLedToast = (countdown: number, interval: ReturnType<typeof setInterval>) => {
//   const { $t } = getIntl()

//   showToast({
//     key: 'BlinkLedApKey',
//     type: 'info',
//     duration: blinkLedCount,
//     extraContent: <CountdownNode n={countdown} />,
//     content: $t({ defaultMessage: 'AP LEDs Blink ...' }),
//     onClose: () => {
//       clearInterval(interval)
//     }
//   })
// }
