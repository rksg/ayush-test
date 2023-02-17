import {
  Dropdown,
  Menu,
  MenuProps,
  Space,
  Badge
} from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker, showActionModal }  from '@acx-ui/components'
import { ArrowExpand, BulbOutlined }                         from '@acx-ui/icons'
import { useEdgeBySerialNumberQuery, useDeleteEdgeMutation } from '@acx-ui/rc/services'
import {
  EdgeStatus,
  EdgeStatusEnum
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { dateRangeForLast, useDateFilter } from '@acx-ui/utils'

import { EdgeStatusLight } from '../../EdgeStatusLight'

import  EdgeDetailsTabs from './EdgeDetailsTabs'

// TODO: component purpose is TBD
const EdgeBulb = (
  { count = 0 }: { count: number | undefined }
) => {
  return (
    <Badge count={count}>
      <Button>
        <BulbOutlined />
      </Button>
    </Badge>
  )
}

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
      'fwVersion',
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
  const [ deleteEdge ] = useDeleteEdgeMutation()

  const status = currentEdge?.deviceStatus as EdgeStatusEnum
  const currentEdgeOperational = status === EdgeStatusEnum.OPERATIONAL


  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (!serialNumber || serialNumber === 'undefined') return

    const actionMap = {
      delete: (_sn: string) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edge' }),
            entityValue: currentEdge?.name,
            numOfEntities: 1
          },
          onOk: () => {
            deleteEdge({ params: { serialNumber: _sn } })
              .then(() => {
                // navigate back to list page
                navigate(`${basePath.pathname}/devices/edge/list`)
              })
          }
        })
      }
    }

    actionMap[e.key as keyof typeof actionMap](serialNumber)
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[{
        label: $t({ defaultMessage: 'Reboot' }),
        key: 'reboot'
      }, {
        label: $t({ defaultMessage: 'Factory Reset' }),
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
      titleExtra={<EdgeStatusLight data={status} />}
      breadcrumb={[
        { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge/list' }
      ]}
      extra={[
        <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={dateRangeForLast(3,'months')}
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
              pathname: `${basePath.pathname}/devices/edge/${serialNumber}/edit/general-settings`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>,
        <EdgeBulb key='bulbCount' count={0} />
      ]}
      footer={<EdgeDetailsTabs currentEdge={currentEdge as EdgeStatus} />}
    />
  )
}
