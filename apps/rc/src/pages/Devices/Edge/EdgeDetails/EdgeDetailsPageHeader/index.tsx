import {
  Menu,
  MenuProps,
  Space
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Button, CaretDownSolidIcon, Dropdown, PageHeader, RangePicker } from '@acx-ui/components'
import { EdgeStatusLight, useEdgeActions }                               from '@acx-ui/rc/components'
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

  const menuConfig = [
    {
      label: $t({ defaultMessage: 'Reboot' }),
      key: 'reboot',
      showupstatus: [
        EdgeStatusEnum.OPERATIONAL,
        EdgeStatusEnum.APPLYING_CONFIGURATION,
        EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED,
        EdgeStatusEnum.FIRMWARE_UPDATE_FAILED
      ]
    },
    {
      label: $t({ defaultMessage: 'Reset and Recover' }),
      key: 'factoryReset',
      showupstatus: [
        EdgeStatusEnum.OPERATIONAL,
        EdgeStatusEnum.APPLYING_CONFIGURATION,
        EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED,
        EdgeStatusEnum.FIRMWARE_UPDATE_FAILED
      ]
    },
    {
      label: $t({ defaultMessage: 'Delete SmartEdge' }),
      key: 'delete',
      showupstatus: [...Object.values(EdgeStatusEnum)]
    }
  ] as { label: string, key: string, showupstatus?: EdgeStatusEnum[] } []

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
      items={
        menuConfig.filter(item =>
          item.showupstatus?.includes(status)
        ).map(item => {
          delete item.showupstatus
          return item
        })
      }
    />
  )

  return (
    <PageHeader
      title={currentEdge?.name || ''}
      titleExtra={<EdgeStatusLight data={status} showText={!currentEdgeOperational}/>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'SmartEdge' }), link: '/devices/edge' }
      ]}
      extra={[
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
        ...filterByAccess([
          <Dropdown overlay={menu}>{()=>
            <Button>
              <Space>
                {$t({ defaultMessage: 'More Actions' })}
                <CaretDownSolidIcon />
              </Space>
            </Button>
          }</Dropdown>,
          <Button
            type='primary'
            onClick={() =>
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/devices/edge/${serialNumber}/edit/general-settings`
              })
            }
          >{$t({ defaultMessage: 'Configure' })}</Button>
        ])
      ]}
      footer={<EdgeDetailsTabs isOperational={currentEdgeOperational} />}
    />
  )
}
