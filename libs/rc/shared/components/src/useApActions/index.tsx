import {
  Loading3QuartersOutlined
} from '@ant-design/icons'
import { Form, Input, Modal, Radio } from 'antd'
import saveAs                        from 'file-saver'
import moment                        from 'moment-timezone'
import { RawIntlProvider, useIntl }  from 'react-intl'

import { cssStr, showActionModal, showToast } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useBlinkLedApMutation,
  useDeleteApGroupsMutation,
  useDeleteApMutation,
  useDeleteSoloApMutation,
  useDownloadApLogMutation,
  useLazyApListQuery,
  useLazyGetDhcpApQuery,
  useRebootApMutation
} from '@acx-ui/rc/services'
import {
  AP,
  ApDeviceStatusEnum,
  ApDhcpRoleEnum,
  APExtended,
  CountdownNode, DhcpAp, DhcpApResponse,
  DhcpApInfo
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { RadioDescription } from '../NetworkApGroupDialog/styledComponents'

const blinkLedCount = 30

export function useApActions () {
  const { $t } = useIntl()
  const wifiEdaflag = useIsSplitOn(Features.WIFI_EDA_READY_TOGGLE)
  const wifiEdaGatewayflag = useIsSplitOn(Features.WIFI_EDA_GATEWAY)
  const [ downloadApLog ] = useDownloadApLogMutation()
  const [ getDhcpAp ] = useLazyGetDhcpApQuery()
  const [ getApList ] = useLazyApListQuery()
  const [ rebootAp ] = useRebootApMutation()
  const [ deleteAp ] = useDeleteApMutation()
  const [ deleteSoloAp ] = useDeleteSoloApMutation()
  const [ blinkLedAp ] = useBlinkLedApMutation()
  const [ deleteApGroups ] = useDeleteApGroupsMutation()

  const deleteSoloFlag = useIsSplitOn(Features.DELETE_SOLO)

  const showRebootAp = (serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {

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
          handler: () => {
            rebootAp({
              params: { tenantId: tenantId, serialNumber },
              payload: { action: 'reboot' }
            })
            callBack && callBack()
          }
        }]
      },
      title: $t({ defaultMessage: 'Reboot Access Point?' }),
      content: $t({ defaultMessage: `Rebooting the AP will disconnect all connected clients.
        Are you sure you want to reboot?` })
    })
  }


  const showDownloadApLog = ( serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {
    const toastKey = showToast({
      type: 'info',
      closable: false,
      extraContent: <div style={{ width: '60px' }}>
        <Loading3QuartersOutlined spin
          style={{ margin: 0, fontSize: '18px', color: cssStr('--acx-primary-white') }}/>
      </div>,
      content: $t({ defaultMessage: 'Preparing log ...' })
    })

    downloadApLog({ params: { tenantId, serialNumber } })
      .unwrap().then((result) => {
        showToast({
          key: toastKey,
          type: 'success',
          content: $t({ defaultMessage: 'Log is ready.' })
        })

        const timeString = moment().format('DDMMYYYY-HHmm')
        saveAs(result.fileURL, `SupportLog_${serialNumber}_${timeString}.log.gz`) //TODO: CORS policy

        callBack && callBack()
      })
      .catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const showDeleteAp = async ( serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {
    const payload = {
      entityType: 'apsList',
      fields: ['serialNumber', 'name', 'deviceStatus', 'fwVersion'],
      filters: {
        serialNumber: [serialNumber]
      },
      pageSize: 1
    }
    const apList = await getApList({
      params: { tenantId }, payload
    }, true).unwrap()
    showDeleteAps(apList.data, tenantId, callBack)
  }

  const showDeleteApGroups = async (row: APExtended,
    tenantId?: string, callBack?: () => void) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'AP Group' }),
        entityValue: row.deviceGroupName,
        numOfEntities: 1
      },
      onOk: () => {
        deleteApGroups({ params: { tenantId }, payload: [row.deviceGroupId] })
          .then(callBack)
      }
    })
  }

  const showDeleteAps = async ( rows: AP[], tenantId?: string, callBack?: ()=>void ) => {
    const dhcpAps = await getDhcpAp({
      params: { tenantId: tenantId },
      payload: rows.map(row => row.serialNumber)
    }, true).unwrap()

    if (hasDhcpAps(dhcpAps, wifiEdaflag || wifiEdaGatewayflag)) {
      showActionModal({
        type: 'warning',
        content: $t({ defaultMessage: 'Not allow to delete DHCP APs' })
      })
      return
    }

    genDeleteModal(rows, deleteSoloFlag, (resetType) => {
      const deleteApApi = resetType === 'solo' ? deleteSoloAp : deleteAp
      rows.length === 1 ?
        deleteApApi({ params: { tenantId: tenantId, serialNumber: rows[0].serialNumber } })
          .then(callBack) :
        deleteApApi({
          params: { tenantId },
          payload: rows.map(row => row.serialNumber)
        }).then(callBack)
    })
  }

  const showBlinkLedAp = ( serialNumber: string, tenantId?: string, callBack?: ()=>void ) => {
    blinkLedAp({ params: { tenantId, serialNumber }, payload: { action: 'blinkLed' } })
      .unwrap().then(() => {
        let count = blinkLedCount
        const interval = setInterval(() => {
          if (count <= 0) {
            clearInterval(interval)
            callBack && callBack()
          } else {
            genBlinkLedToast(count--, interval)
          }
        }, 1000)
      })
  }

  return {
    showDeleteAp,
    showDeleteAps,
    showDeleteApGroups,
    showDownloadApLog,
    showRebootAp,
    showBlinkLedAp
  }
}

const hasContactedAp = (selectedRows: AP[]) => {
  return !selectedRows.every(selectedAp =>
    selectedAp.deviceStatus === ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD ||
    selectedAp.deviceStatus === ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD)
}
const allOperationalAp = (selectedRows: AP[]) => {
  return selectedRows.every(ap =>
    ap.deviceStatus === ApDeviceStatusEnum.OPERATIONAL
  )
}
const hasInvalidAp = (selectedRows: AP[]) => {
  return !selectedRows.every(ap => {
    if (ap.fwVersion === undefined) {
      return true
    }
    else {
      return ap.fwVersion.localeCompare('6.2.0.103.486',
        undefined, { numeric: true, sensitivity: 'base' }) >= 0
    }
  })
}

const hasDhcpAps = (dhcpAps: DhcpAp, featureFlag: boolean) => {
  let res: DhcpApInfo[] = []
  if (dhcpAps && featureFlag) {
    res = dhcpAps as DhcpApInfo[]
  } else {
    const response = dhcpAps as DhcpApResponse
    res = Array.isArray(response.response) ? response.response : []
  }

  const dhcpApMap = res.filter(dhcpAp =>
    dhcpAp.venueDhcpEnabled === true &&
    (dhcpAp.dhcpApRole === ApDhcpRoleEnum.PrimaryServer ||
      dhcpAp.dhcpApRole === ApDhcpRoleEnum.BackupServer))

  return dhcpApMap.length > 0
}

const genDeleteModal = (
  rows: AP[],
  deleteSoloFlag: boolean,
  okHandler: (resetType: string) => void
) => {
  const { $t } = getIntl()

  const showResetFirmwareOption = allOperationalAp(rows) && !hasInvalidAp(rows)
  const invalidAp = allOperationalAp(rows) && hasInvalidAp(rows)
  const hideConfirmation = !hasContactedAp(rows)

  const entityValue = rows.length === 1 ? rows[0].name : undefined
  const modal = Modal.confirm({})

  const title = $t({
    defaultMessage: `Delete {count, plural,
      one {"{entityValue}"}
      other {{count} APs}
    }?`
  }, { count: rows.length, entityValue })

  const confirmText = 'Delete'
  let resetType = 'cloud'

  const content = (<Form layout='vertical'>
    <Form.Item>{$t({
      defaultMessage: `Are you sure you want to delete {count, plural,
        one {this AP}
        other {these APs}
      } ?`
    }, { count: rows.length })}</Form.Item >

    {hideConfirmation && <Form.Item>{$t({ defaultMessage: `
      You are deleting one or more offline APs.
      When these offline devices come back online
      their configuration will be factory reset and they will be removed from RUCKUS One.`
    })}</Form.Item >}

    {!showResetFirmwareOption && !hideConfirmation && <Form.Item>{$t({
      defaultMessage: `Once deleted, the AP will factory reset to Cloud ready.
      The existing configuration will be wiped, AP firmware will remain Cloud-only firmware.
      AP will be ready to re-connect to the Cloud.`
    })}</Form.Item >}

    {invalidAp && <Form.Item>{$t({
      defaultMessage: `
      The AP's firmware does not support resetting them to standalone AP.`
    })}</Form.Item >}

    {showResetFirmwareOption && <Form.Item
      label={$t({ defaultMessage: 'Type the word "{text}" to confirm:' }, { text: confirmText })}>
      <Input onChange={(e) => {
        const disabled = e.target.value.toLowerCase() !== confirmText.toLowerCase()
        modal.update({
          okButtonProps: { disabled }
        })
      }} />
    </Form.Item>}

    {deleteSoloFlag && showResetFirmwareOption && <Form.Item
      label={$t({ defaultMessage: 'Select what should happen to the APs’ configuration:' })}>
      <Radio.Group defaultValue={'cloud'} onChange={(e) => {resetType = e.target.value}}>
        <Radio value='cloud'>
          {$t({ defaultMessage: 'Factory reset to Cloud ready' })}
          <RadioDescription>{$t({ defaultMessage: `
          Existing configuration will be wiped,
          AP firmware will remain Cloud-only firmware.
          AP will be ready to re-connect to the Cloud.` })}
          </RadioDescription>
        </Radio>
        <Radio value='solo'>
          {$t({ defaultMessage: 'Factory reset to standalone firmware' })}
          <RadioDescription>{$t({ defaultMessage: `
          Existing configuration will be wiped,
          AP firmware will be modified to standalone image.
          AP will be ready to connect to any controller or operate standalone.
          Please note that this option will download and update your AP firmware,
          which will take longer.` })}
          </RadioDescription>
        </Radio>
      </Radio.Group>
    </Form.Item>}
  </Form>)

  const config = {
    icon: <> </>,
    title: title,
    content: content,
    cancelText: $t({ defaultMessage: 'Cancel' }),
    okText: $t({ defaultMessage: 'Delete' }),
    okButtonProps: { disabled: showResetFirmwareOption },
    onOk: () => {okHandler(resetType)}
  }
  modal.update({
    ...config,
    content: <RawIntlProvider value={getIntl()} children={config.content} />
  })

  return modal
}

const genBlinkLedToast = (countdown: number, interval: ReturnType<typeof setInterval>) => {
  const { $t } = getIntl()

  showToast({
    key: 'BlinkLedApKey',
    type: 'info',
    duration: blinkLedCount,
    extraContent: <CountdownNode n={countdown} />,
    content: $t({ defaultMessage: 'AP LEDs Blink ...' }),
    onClose: () => {
      clearInterval(interval)
    }
  })
}
