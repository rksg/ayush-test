import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  Table,
  TableProps,
  Drawer,
  Button,
  showToast
} from '@acx-ui/components'
import { useSwitchActions }                        from '@acx-ui/rc/components'
import { useLazyGetSwitchFirmwareStatusListQuery } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  SwitchFirmwareStatus,
  SwitchFwStatusEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { parseSwitchVersion } from '../../../FirmwareUtils'

export interface VenueStatusDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenue
}

export function VenueStatusDrawer (props: VenueStatusDrawerProps) {
  const { $t } = useIntl()
  const params = useParams()

  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareStatusListQuery()
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmwareStatus[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      payload: { venueId: props.data.id }
    }, true)).data?.data
    setSwitchFirmwareStatusList(switchList as unknown as SwitchFirmwareStatus[])
  }

  const onClose = () => {
    props.setVisible(false)
  }

  useEffect(() => {
    if(props.data.id){
      setSwitchList()
    }
  }, [props.data.id])

  const switchAction = useSwitchActions()

  const columns: TableProps<SwitchFirmwareStatus>['columns'] = [
    {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left'
    }, {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
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
            [SwitchFwStatusEnum.FW_UPD_FAIL]:
              $t({ defaultMessage: 'Firmware Update - Failed' })
          }

          if (row.status === SwitchFwStatusEnum.FW_UPD_FAIL) {
            return <div>
              <Typography.Text
                style={{ lineHeight: '24px' }}>
                {fwMappings[row.status]}.
              </Typography.Text>
              <Button
                size='small'
                ghost={true}
                style={{
                  color: '#5496EA',
                  padding: '0',
                  marginLeft: '5px',
                  marginBottom: '2px'
                }}
                onClick={() => {
                  const switchId = row.switchId
                  const callback = () => {
                    showToast({
                      type: 'success',
                      content: $t({ defaultMessage: 'Start firmware upgrade retry' })
                    })
                  }
                  switchAction.doRetryFirmwareUpdate(switchId, params.tenantId, callback)
                }}>
                {$t({ defaultMessage: 'Retry' })}
              </Button></div>
          }
          return fwMappings[row.status]
        }
        return '--'
      }
    }, {
      key: 'targetFirmware',
      title: $t({ defaultMessage: 'Target Firmware' }),
      dataIndex: 'targetFirmware',
      sorter: true,
      render: function (_, row) {
        if (row.targetFirmware) {
          return parseSwitchVersion(row.targetFirmware)
        } else {
          return '--'
        }
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
        <b>  {$t({ defaultMessage: 'Venue:' })}</b> {props.data.name}
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
