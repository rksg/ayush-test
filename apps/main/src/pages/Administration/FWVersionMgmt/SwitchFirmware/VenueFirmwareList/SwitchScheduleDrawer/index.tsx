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
  const { $t } = useIntl()

  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareListQuery()
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmware[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      payload: { venueIdList: [props.data.id] }
    }, true)).data?.data
    setSwitchFirmwareStatusList(switchList as unknown as SwitchFirmware[])
  }

  const onClose = () => {
    props.setVisible(false)
  }

  useEffect(() => {
    if(props.data.id){
      setSwitchList()
    }
  }, [props.data.id])
  const intl = useIntl()
  const columns: TableProps<SwitchFirmware>['columns'] = [
    {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left'
    }, {
      key: 'Scheduled for',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      sorter: true,
      render: function (_, row) {
        return (!enableSwitchScheduleTooltip(row) //disabledSwitchItemNextScheduleTooltip
          ? getSwitchNextScheduleTpl(intl, row)
          // eslint-disable-next-line max-len
          : <Tooltip title={<UI.ScheduleTooltipText>{getSwitchScheduleTpl(row)}</UI.ScheduleTooltipText>} placement='bottom'>
            <UI.WithTooltip>{getSwitchNextScheduleTpl(intl, row)}</UI.WithTooltip>
          </Tooltip>
        )
      }
    }
  ]
  return (<Drawer
    title={$t({ defaultMessage: 'Scheduled update' })}
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
