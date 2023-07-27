import {
  Dropdown,
  Menu,
  MenuProps,
  Space
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker } from '@acx-ui/components'
import { ArrowExpand }                     from '@acx-ui/icons'
import { EdgeStatusLight, useEdgeActions } from '@acx-ui/rc/components'
import {
  useEdgeBySerialNumberQuery
} from '@acx-ui/rc/services'
import {
  EdgeStatusEnum
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import EdgeDetailsTabs from './EdgeDetailsTabs'

export const EdgeDetailsPageHeader = () => {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const params = useParams()
  const { serialNumber } = params

  const edgeStatusPayload = {
    fields: [
      'name',
      'venueName',
      'type',
      'serialNumber',
      'ports',
      'ip',
      'model',
      'firmwareVersion',
      'deviceStatus',
      'deviceSeverity',
      'venueId',
      'tags'
    ],
    filters: { serialNumber: [serialNumber] } }
  const { data: currentEdge }
  = useEdgeBySerialNumberQuery({
    params, payload: edgeStatusPayload
  })

  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const { reboot, factoryReset, deleteEdges } = useEdgeActions()

  const status = currentEdge?.deviceStatus as EdgeStatusEnum
  const currentEdgeOperational = status === EdgeStatusEnum.OPERATIONAL


  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (!currentEdge) return
    switch(e.key) {
      case 'reboot':
        reboot(currentEdge)
        break
      case 'factoryReset':
        factoryReset(currentEdge)
        break
      case 'delete':
        deleteEdges(
          [currentEdge],
          () => navigate(`${basePath.pathname}/devices/edge`)
        )
        break
      default:
        return
    }
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[{
        label: $t({ defaultMessage: 'Reboot' }),
        key: 'reboot'
      }, {
        label: $t({ defaultMessage: 'Reset and Recover' }),
        key: 'factoryReset'
      }, {
        label: $t({ defaultMessage: 'Delete SmartEdge' }),
        key: 'delete'
      }].filter(item => currentEdgeOperational || item.key === 'delete')}
    />
  )

  return (
    <PageHeader
      title={currentEdge?.name || ''}
      titleExtra={<EdgeStatusLight data={status} showText={!currentEdgeOperational}/>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge' }
      ]}
      extra={filterByAccess([
        <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        <Dropdown overlay={menu}>
          <Button>
            <Space>
              {$t({ defaultMessage: 'More Actions' })}
              <ArrowExpand />
            </Space>
          </Button>
        </Dropdown>,
        <Button
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/devices/edge/${serialNumber}/edit/general-settings`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ])}
      footer={<EdgeDetailsTabs isOperational={currentEdgeOperational} />}
    />
  )
}
