import { useEffect, useState } from 'react'

import { Row, Tooltip, Typography } from 'antd'
import { useIntl }                  from 'react-intl'

import {
  Table,
  TableProps,
  Drawer
} from '@acx-ui/components'
import { useSwitchFirmwareUtils }                 from '@acx-ui/rc/components'
import { useLazyGetSwitchFirmwareListV1002Query } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenueV1002,
  SwitchFirmwareV1002,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'

import {  getNextScheduleTplV1002 } from '../../../FirmwareUtils'
import * as UI                      from '../../../styledComponents'
import {
  enableSwitchScheduleTooltip,
  getSwitchNextScheduleTpl
} from '../switch.upgrade.util'
export interface SwitchScheduleDrawerProps {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  data: FirmwareSwitchVenueV1002
}

export function SwitchScheduleDrawer (props: SwitchScheduleDrawerProps) {
  const intl = useIntl()
  const {
    getSwitchNextScheduleTplTooltipV1002,
    getSwitchScheduleTplV1002
  } = useSwitchFirmwareUtils()


  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareListV1002Query({
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
  })
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmwareV1002[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      params: { venueId: props.data.venueId }
    }, false)).data?.data
    if (switchList) {
      const filterSwitchList = switchList.filter(row => row.isSwitchLevelSchedule)
      setSwitchFirmwareStatusList(filterSwitchList as SwitchFirmwareV1002[])
    }
  }

  useEffect(() => {
    if (props.data.venueId && props.visible) {
      setSwitchList()
    }
  }, [props.data.venueId, props.visible])

  const onClose = () => {
    props.setVisible(false)
  }

  const columns: TableProps<SwitchFirmwareV1002>['columns'] = [
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
              {getSwitchScheduleTplV1002(row)}
            </UI.ScheduleTooltipText>}
          placement='bottom'>
            <UI.WithTooltip>{getSwitchScheduleTplV1002(row)}</UI.WithTooltip>
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
          <b> {intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>:' })}</b>{
            props.data.venueName}
        </Typography.Text>
      </Row>
      <Row style={{ lineHeight: '24px' }}>
        <Typography.Text>
          <b>  {intl.$t({ defaultMessage: 'Scheduled for:' })}</b> {
            getNextScheduleTplV1002(intl, props.data)}
        </Typography.Text>
      </Row>
      <Row style={{ lineHeight: '24px' }}>
        <Typography.Text>
          <b>{intl.$t({ defaultMessage: 'Target Firmware:' })}</b> {
            getSwitchNextScheduleTplTooltipV1002(intl, props.data) ||
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
