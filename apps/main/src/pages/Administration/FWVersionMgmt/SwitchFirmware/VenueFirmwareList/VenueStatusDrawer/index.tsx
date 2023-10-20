import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  Table,
  TableProps,
  Drawer
} from '@acx-ui/components'
import { useLazyGetSwitchFirmwareStatusListQuery }   from '@acx-ui/rc/services'
import { FirmwareSwitchVenue, SwitchFirmwareStatus } from '@acx-ui/rc/utils'

import { parseSwitchVersion } from '../../../FirmwareUtils'

export interface VenueStatusDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenue
}

export function VenueStatusDrawer (props: VenueStatusDrawerProps) {
  const { $t } = useIntl()

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
      sorter: true
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
