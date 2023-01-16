/* eslint-disable max-len */
import { useContext } from 'react'

import { Dropdown, Menu, Space } from 'antd'
import moment                    from 'moment-timezone'
import { useIntl }               from 'react-intl'

import { Button, PageHeader, RangePicker } from '@acx-ui/components'
import { ArrowExpand }                     from '@acx-ui/icons'
import { SwitchStatus }                    from '@acx-ui/rc/components'
import { SwitchRow, SwitchViewModel }      from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'
import { dateRangeForLast, useDateFilter } from '@acx-ui/utils'

import SwitchTabs from './SwitchTabs'

import { SwitchDetailsContext } from '.'

function SwitchPageHeader () {
  const { $t } = useIntl()
  const { switchId, serialNumber } = useParams()
  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)
  const { switchDetailHeader, currentSwitchOperational } = switchDetailsContextData

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}`)


  // const handleMenuClick: MenuProps['onClick'] = (e) => { TODO:
  //   // console.log('click', e)
  // }

  const menu = (
    <Menu
      // onClick={handleMenuClick}
      items={[
        {
          label: $t({ defaultMessage: 'Sync Data' }),
          key: '1'
        },
        {
          type: 'divider'
        },
        {
          label: $t({ defaultMessage: 'Reboot Switch' }),
          key: '2'
        },
        {
          label: $t({ defaultMessage: 'CLI Session' }),
          key: '3'
        },
        {
          type: 'divider'
        },
        {
          label: $t({ defaultMessage: 'Delete Switch' }),
          key: '4'
        }
      ]}
    />
  )

  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return (
    <PageHeader
      title={switchDetailHeader?.name || switchDetailHeader?.switchName || switchDetailHeader?.serialNumber || ''}
      titleExtra={
        <SwitchStatus row={switchDetailHeader as unknown as SwitchRow} showText={!currentSwitchOperational} />}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Switches' }), link: '/devices/switch' }
      ]}
      extra={[
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={dateRangeForLast(3, 'months')}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        <Dropdown overlay={menu} key='actionMenu'>
          <Button>
            <Space>
              {$t({ defaultMessage: 'More Actions' })}
              <ArrowExpand />
            </Space>
          </Button>
        </Dropdown>,
        <Button
          key='configure'
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ]}
      footer={<SwitchTabs switchDetail={switchDetailHeader as SwitchViewModel} />}
    />
  )
}

export default SwitchPageHeader