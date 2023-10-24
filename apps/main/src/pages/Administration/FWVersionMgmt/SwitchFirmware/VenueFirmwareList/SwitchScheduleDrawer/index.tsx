import { useEffect, useState } from 'react'

import { Tooltip, Typography } from 'antd'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Drawer
} from '@acx-ui/components'
import { useLazyGetSwitchFirmwareListQuery } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  SwitchFirmware
} from '@acx-ui/rc/utils'

import * as UI                                                                         from '../../../styledComponents'
import { enableSwitchScheduleTooltip, getSwitchNextScheduleTpl, getSwitchScheduleTpl } from '../SwitchUpgradeWizard/switch.upgrade.util'
export interface SwitchScheduleDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenue
}

export function SwitchScheduleDrawer (props: SwitchScheduleDrawerProps) {
  const intl = useIntl()

  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareListQuery()
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmware[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      payload: { venueIdList: [props.data.id] }
    }, true)).data?.data
    setSwitchFirmwareStatusList(switchList as unknown as SwitchFirmware[])
  }

  useEffect(() => {
    if(props.data.id){
      setSwitchList()
    }
  }, [props.data.id])

  const onClose = () => {
    props.setVisible(false)
  }

  const columns: TableProps<SwitchFirmware>['columns'] = [
    {
      key: 'switchName',
      title: intl.$t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left'
    }, {
      key: 'Scheduled for',
      title: intl.$t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
      render: function (_, row) {
        return (!enableSwitchScheduleTooltip(row)
          ? getSwitchNextScheduleTpl(intl, row)
          : <Tooltip title={
            <UI.ScheduleTooltipText>
              {getSwitchScheduleTpl(row)}
            </UI.ScheduleTooltipText>}
          placement='bottom'>
            <UI.WithTooltip>{getSwitchNextScheduleTpl(intl, row)}</UI.WithTooltip>
          </Tooltip>
        )
      }
    }
  ]
  return (<Drawer
    title={intl.$t({ defaultMessage: 'Scheduled update' })}
    visible={props.visible}
    onClose={onClose}
    width={580}
    children={<>
      <Typography.Text>
        <b>  {intl.$t({ defaultMessage: 'Venue:' })}</b> {props.data.name} <br/>
        {/* <b>  {intl.$t({ defaultMessage: 'Scheduled for:' })}</b> {props.data.name}  TODO****/}
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
