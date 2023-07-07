import {
  Menu,
  MenuProps,
  Space
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Dropdown, CaretDownSolidIcon, Button, PageHeader, RangePicker, showActionModal } from '@acx-ui/components'
import { EdgeStatusLight }                                                                from '@acx-ui/rc/components'
import {
  useDeleteEdgeMutation,
  useEdgeBySerialNumberQuery,
  useFactoryResetEdgeMutation,
  useRebootEdgeMutation
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
  const actions = useEdgeActions(currentEdge?.name, serialNumber)

  const status = currentEdge?.deviceStatus as EdgeStatusEnum
  const currentEdgeOperational = status === EdgeStatusEnum.OPERATIONAL


  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (!serialNumber || serialNumber === 'undefined') return
    if(e.key === 'delete') {
      actions[e.key as keyof typeof actions](
        () => navigate(`${basePath.pathname}/devices/edge`)
      )
    } else {
      actions[e.key as keyof typeof actions]()
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
      ])}
      footer={<EdgeDetailsTabs />}
    />
  )
}

const useEdgeActions = (edgeName?: string, serialNumber?: string): {
  [key: string]: (callback?: () => void) => void
} => {
  const { $t } = useIntl()
  const [ deleteEdge ] = useDeleteEdgeMutation()
  const [ rebootEdge ] = useRebootEdgeMutation()
  const [ factoryResetEdge ] = useFactoryResetEdgeMutation()

  return {
    reboot: () => {
      showActionModal({
        type: 'confirm',
        title: $t(
          { defaultMessage: 'Reboot "{edgeName}"?' },
          { edgeName }
        ),
        content: $t({
          defaultMessage: `Rebooting the SmartEdge will disconnect all connected clients.
            Are you sure you want to reboot?`
        }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Reboot' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: () => {
              rebootEdge({ params: { serialNumber } })
            }
          }]
        }
      })
    },
    factoryReset: () => {
      showActionModal({
        type: 'confirm',
        title: $t(
          { defaultMessage: 'Reset and recover "{edgeName}"?' },
          { edgeName }
        ),
        content: $t({
          defaultMessage: 'Are you sure you want to reset and recover this SmartEdge?'
        }),
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Reset' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: () => {
              factoryResetEdge({ params: { serialNumber } })
            }
          }]
        }
      })
    },
    delete: (callBack) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'SmartEdge' }),
          entityValue: edgeName,
          numOfEntities: 1
        },
        onOk: () => {
          deleteEdge({ params: { serialNumber } })
            .then(() => callBack?.())
        }
      })
    }
  }
}
