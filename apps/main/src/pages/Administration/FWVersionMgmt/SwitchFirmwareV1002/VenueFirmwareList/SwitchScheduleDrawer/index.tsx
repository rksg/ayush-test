import { useEffect, useState } from 'react'

import {
  Button,
  Row,
  Tooltip,
  Typography
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Drawer
} from '@acx-ui/components'
import { getNextScheduleTplV1002 }                from '@acx-ui/rc/components'
import { useLazyGetSwitchFirmwareListV1001Query } from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenueV1002,
  SwitchFirmwareV1002,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { useSwitchFirmwareUtils }            from '@acx-ui/switch/components'
import { TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'

import * as UI               from '../../../styledComponents'
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
    getSwitchDrawerNextScheduleTpl,
    getSwitchScheduleTplV1002,
    getSwitchDrawerVenueScheduleArray
  } = useSwitchFirmwareUtils()

  const [showMoreVenueSchedule, setShowMoreVenueSchedule] = useState<boolean>(false)
  const [ getSwitchFirmwareStatusList ] = useLazyGetSwitchFirmwareListV1001Query({
    pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL
  })
  const [switchFimwareStatusList, setSwitchFirmwareStatusList] =
    useState([] as SwitchFirmwareV1002[])

  const setSwitchList = async () => {
    const switchList = (await getSwitchFirmwareStatusList({
      params: { venueId: props.data.venueId },
      payload: { venueIdList: [props.data.venueId] }
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
    setShowMoreVenueSchedule(false)
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

  const getVenueTargetFirmware = () => {
    const venueScheduleArray = getSwitchDrawerVenueScheduleArray(props.data)
    if (venueScheduleArray.length === 0) return

    const allVersionsAreSame = _.uniq(venueScheduleArray).length === 1
    const buttonText = showMoreVenueSchedule
      ? intl.$t({ defaultMessage: 'Show Less' })
      : intl.$t({ defaultMessage: 'Show More' })
    const scheduleText = allVersionsAreSame
      ? venueScheduleArray[0]
      : intl.$t({ defaultMessage: 'Multiple' })

    return (
      <>
        {scheduleText}
        {' ('}
        <Button
          type='link'
          size='small'
          onClick={() => setShowMoreVenueSchedule(!showMoreVenueSchedule)}
        >
          {buttonText}
        </Button>
        {')'}
        {showMoreVenueSchedule && getSwitchDrawerNextScheduleTpl(intl, props.data)}
      </>
    )
  }

  return (<Drawer
    title={intl.$t({ defaultMessage: 'Scheduled update' })}
    visible={props.visible}
    onClose={onClose}
    width={580}
    children={<>
      <div style={{ background: '#f7f7f7', padding: '5px 10px' }}>
        <Row style={{ lineHeight: '24px' }}>
          <Typography.Text>
            <b style={{ paddingRight: '5px' }}>
              {intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>:' })}  </b>
            {props.data.venueName}
          </Typography.Text>
        </Row>
        <Row style={{ lineHeight: '24px' }}>
          <Typography.Text>
            <b style={{ paddingRight: '5px' }}>
              {intl.$t({ defaultMessage: 'Scheduled for:' })}  </b>
            {getNextScheduleTplV1002(intl, props.data)}
          </Typography.Text>
        </Row>
        <Row style={{ lineHeight: '24px' }}>
          <Typography.Text>
            <b style={{ paddingRight: '5px' }}>
              {intl.$t({ defaultMessage: 'Target Firmware:' })}</b>
            {getVenueTargetFirmware() ||
              intl.$t({ defaultMessage: 'Not been set up yet' })}
          </Typography.Text>
        </Row>
      </div>
      <Row style={{ marginTop: '30px' }}>
        <Typography.Text>
          <span style={{
            fontSize: '14px',
            marginLeft: '8px',
            fontWeight: 600
          }}>
            {intl.$t({ defaultMessage: 'Switches with their own update schedule' })}</span>
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
