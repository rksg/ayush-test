import { useEffect, useState } from 'react'

import { Row, Tooltip, Typography } from 'antd'
import { useIntl }                  from 'react-intl'

import {
  Table,
  TableProps,
  Drawer
} from '@acx-ui/components'
import { useSwitchFirmwareUtils }            from '@acx-ui/rc/components'
import { useLazyGetSwitchFirmwareListQuery } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  SwitchFirmware,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'

import { getNextScheduleTpl } from '../../../FirmwareUtils'
import * as UI                from '../../../styledComponents'
import {
  enableSwitchScheduleTooltip,
  getSwitchNextScheduleTpl
} from '../switch.upgrade.util'
export interface SwitchScheduleDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenue
}

export function SwitchScheduleDrawer (props: SwitchScheduleDrawerProps) {
  const intl = useIntl()
  const {
    getSwitchNextScheduleTplTooltip,
    getSwitchScheduleTpl
  } = useSwitchFirmwareUtils()

  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareListQuery({
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
  })
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmware[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      payload: { venueIdList: [props.data.id] }
    }, false)).data?.data
    if (switchList) {
      const filterSwitchList = switchList.filter(row => row.isSwitchLevelSchedule)
      setSwitchFirmwareStatusList(filterSwitchList as SwitchFirmware[])
    }
  }

  useEffect(() => {
    if (props.data.id && props.visible) {
      setSwitchList()
    }
  }, [props.data.id, props.visible])

  const onClose = () => {
    props.setVisible(false)
  }

  const columns: TableProps<SwitchFirmware>['columns'] = [
    {
      key: 'switchName',
      title: intl.$t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('switchName', defaultSort) },
      fixed: 'left'
    }, {
      key: 'scheduledFor',
      title: intl.$t({ defaultMessage: 'Scheduled for' }),
      dataIndex: 'scheduledFor',
      width: 160,
      sorter: false,
      render: function (_, row) {
        return (!enableSwitchScheduleTooltip(row)
          ? <Tooltip
            title={intl.$t({ defaultMessage: 'Firmware update not applicable' })}
            placement='bottom'>
            <UI.WithTooltip>
              {intl.$t({ defaultMessage: 'Firmware update not applicable' })}
            </UI.WithTooltip>
          </Tooltip>
          : <Tooltip title={
            <UI.ScheduleTooltipText>
              {getSwitchNextScheduleTpl(intl, row)}
            </UI.ScheduleTooltipText>}
          placement='bottom'>
            <UI.WithTooltip>{getSwitchNextScheduleTpl(intl, row)}</UI.WithTooltip>
          </Tooltip>
        )
      }
    }, {
      key: 'targetFirmware',
      title: intl.$t({ defaultMessage: 'Target Firmware' }),
      dataIndex: 'targetFirmware',
      sorter: false,
      render: function (_, row) {
        return (!enableSwitchScheduleTooltip(row)
          ? <Tooltip
            title={intl.$t({ defaultMessage: 'Firmware update not applicable' })}
            placement='bottom'>
            <UI.WithTooltip>
              {intl.$t({ defaultMessage: 'Firmware update not applicable' })}
            </UI.WithTooltip>
          </Tooltip>
          : <Tooltip title={
            <UI.ScheduleTooltipText>
              {getSwitchScheduleTpl(row)}
            </UI.ScheduleTooltipText>}
          placement='bottom'>
            <UI.WithTooltip>{getSwitchScheduleTpl(row)}</UI.WithTooltip>
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
      <Row style={{ lineHeight: '24px' }}>
        <Typography.Text>
          <b>  {intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>:' })}</b> {props.data.name}
        </Typography.Text>
      </Row>
      <Row style={{ lineHeight: '24px' }}>
        <Typography.Text>
          <b>  {intl.$t({ defaultMessage: 'Scheduled for:' })}</b> {
            getNextScheduleTpl(intl, props.data)}
        </Typography.Text>
      </Row>
      <Row style={{ lineHeight: '24px' }}>
        <Typography.Text>
          <b>{intl.$t({ defaultMessage: 'Target Firmware:' })}</b> {
            getSwitchNextScheduleTplTooltip(props.data) ||
            intl.$t({ defaultMessage: 'Not been set up yet' })}
        </Typography.Text>
      </Row>

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
