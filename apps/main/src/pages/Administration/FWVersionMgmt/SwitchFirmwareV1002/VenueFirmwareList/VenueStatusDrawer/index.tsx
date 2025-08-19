import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  Table,
  TableProps,
  Drawer,
  showToast
} from '@acx-ui/components'
import { toUserDate }                              from '@acx-ui/rc/components'
import { useLazyGetSwitchFirmwareStatusListQuery } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenueV1002,
  SwitchFirmwareStatus,
  SwitchFwStatusEnum,
  SwitchStatusRdbEnum,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { useSwitchFirmwareUtils }                           from '@acx-ui/switch/components'
import { useSwitchActions }                                 from '@acx-ui/switch/components'
import { TABLE_QUERY_LONG_POLLING_INTERVAL, noDataDisplay } from '@acx-ui/utils'

import * as UI from '../styledComponents'

export interface VenueStatusDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenueV1002
}

export function VenueStatusDrawer (props: VenueStatusDrawerProps) {
  const { $t } = useIntl()
  const { parseSwitchVersion } = useSwitchFirmwareUtils()

  const switchAction = useSwitchActions()

  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareStatusListQuery({
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
  })
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmwareStatus[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      params: { venueId: props.data.venueId },
      enableRbac: true
    }, false)).data?.data
    if (switchList) {
      setSwitchFirmwareStatusList(switchList as unknown as SwitchFirmwareStatus[])
    }
  }

  const onClose = () => {
    props.setVisible(false)
  }

  useEffect(() => {
    if (props.data.venueId && props.visible) {
      setSwitchList()
    }
  }, [props.data, props.visible])


  const columns: TableProps<SwitchFirmwareStatus>['columns'] = [
    {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('switchName', defaultSort) },
      fixed: 'left'
    }, {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: false,
      render: function (_, row) {
        if (Object.values(SwitchFwStatusEnum).includes(row.status)) {
          const fwMappings = {
            [SwitchFwStatusEnum.FW_UPD_START]:
              $t({ defaultMessage: 'Firmware Updating' }),
            [SwitchFwStatusEnum.FW_UPD_VALIDATING_PARAMETERS]:
              $t({ defaultMessage: 'Firmware Update - Validating Parameters' }),
            [SwitchFwStatusEnum.FW_UPD_DOWNLOADING]:
              $t({ defaultMessage: 'Firmware Update - Downloading' }),
            [SwitchFwStatusEnum.FW_UPD_VALIDATING_IMAGE]:
              $t({ defaultMessage: 'Firmware Update - Validating Image' }),
            [SwitchFwStatusEnum.FW_UPD_SYNCING_TO_REMOTE]:
              $t({ defaultMessage: 'Firmware Update - Syncing To Remote' }),
            [SwitchFwStatusEnum.FW_UPD_WRITING_TO_FLASH]:
              $t({ defaultMessage: 'Firmware Update - Writing To Flash' }),
            [SwitchFwStatusEnum.FW_UPD_COMPLETE]:
              $t({ defaultMessage: 'Firmware Update - Success' }),
            [SwitchFwStatusEnum.FW_UPD_PRE_DOWNLOAD_COMPLETE]:
              $t({ defaultMessage: 'Firmware Update - Pre-download Completed' }),
            [SwitchFwStatusEnum.FW_UPD_FAIL]:
              $t({ defaultMessage: 'Firmware Update - Failed' }),
            [SwitchFwStatusEnum.FW_UPD_WAITING_RESPONSE]:
              $t({ defaultMessage: 'Firmware Update - Awaiting Response from Switch' }),
            [SwitchStatusRdbEnum.DISCONNECTED]:
              $t({ defaultMessage: 'Disconnected from cloud' })
          }

          if (row.switchStatus === SwitchStatusRdbEnum.DISCONNECTED) {
            return fwMappings[row.switchStatus]
          }

          // If the upgrade fails, the RDB switch status will stay at 'firmware_upgrading',
          // and only then the retry button will appear.
          if (row.status === SwitchFwStatusEnum.FW_UPD_FAIL &&
            row.switchStatus === SwitchStatusRdbEnum.FIRMWARE_UPGRADING) {
            return <div>
              <Typography.Text
                style={{ lineHeight: '24px' }}>
                {fwMappings[row.status]}.
              </Typography.Text>
              <UI.TextButton
                size='small'
                ghost={true}
                onClick={() => {
                  const switchId = row.switchId
                  const callback = () => {
                    showToast({
                      type: 'success',
                      content: $t({ defaultMessage: 'Start firmware upgrade retry' })
                    })
                  }
                  switchAction.doRetryFirmwareUpdateV1002({
                    switchId,
                    venueId: props.data.venueId
                  }, callback)
                }}>
                {$t({ defaultMessage: 'Retry' })}
              </UI.TextButton></div>
          }
          return fwMappings[row.status]
        }
        return '--'
      }
    }, {
      key: 'targetFirmware',
      title: $t({ defaultMessage: 'Target Firmware' }),
      dataIndex: 'targetFirmware',
      sorter: false,
      render: function (_, row) {
        if (row.targetFirmware) {
          return parseSwitchVersion(row.targetFirmware)
        } else {
          return '--'
        }
      }
    }, {
      key: 'lastStatusUpdateTime',
      title: $t({ defaultMessage: 'Last Update' }),
      dataIndex: 'lastStatusUpdateTime',
      sorter: false,
      render: function (_, row) {
        return toUserDate(row.lastStatusUpdateTime || noDataDisplay)
      }
    }
  ]
  return (<Drawer
    title={$t({ defaultMessage: 'Firmware update status' })}
    visible={props.visible}
    onClose={onClose}
    width={580}
    children={<>
      <Typography.Text>
        <b>  {$t({ defaultMessage: '<VenueSingular></VenueSingular>:' })}</b> {props.data.venueName}
      </Typography.Text>
      <Table
        columns={columns}
        type={'tall'}
        dataSource={switchFimwareStatusList}
        rowKey='id'
      />
    </>
    }
  />
  )
}
