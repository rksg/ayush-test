import { Form, Switch, Space } from 'antd'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import {
  QosMapSetOptions
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const { useWatch } = Form

export function QosMapSetFrom () {
  const { $t } = useIntl()
  const qosMapSetFlag = useIsSplitOn(Features.WIFI_EDA_QOS_MAP_SET_TOGGLE)

  const enableQosMapSetFieldName = ['wlan', 'advancedCustomization', 'qosMapSetEnabled']
  const [ enableQosMapSet ] = [ useWatch<boolean>(enableQosMapSetFieldName) ]


  const columns = useColumns()

  return (
    qosMapSetFlag ?
      <>
        <UI.Subtitle>
          {$t({ defaultMessage: 'QoS Map' })}
        </UI.Subtitle>
        <UI.FieldLabel width='250px'>
          <Space>
            {$t({ defaultMessage: 'QoS Map Set' })}
          </Space>
          <Form.Item
            name={['wlan', 'advancedCustomization', 'qosMapSetEnabled']}
            style={{ marginBottom: '10px' }}
            valuePropName='checked'
            initialValue={false}
            children={<Switch
              data-testid='qos-map-set-enabled'
            />}
          />
        </UI.FieldLabel>
        {enableQosMapSet &&
        <UI.FieldLabel width='450px'>
          <Table
            columns={columns}
          />
        </UI.FieldLabel>

        }
      </>:null
  )
}

function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<QosMapSetOptions>['columns'] = [
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      render: function (data, row) {
        return `${row.priority}`
      }
    },
    {
      title: $t({ defaultMessage: 'DSCP Range' }),
      key: 'dscpRange',
      dataIndex: 'dscpRange'
    },
    {
      title: $t({ defaultMessage: 'Exception DSCP Values' }),
      key: 'exceptionDscpValues',
      dataIndex: 'exceptionDscpValues'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      render: function (data, row) {
        return `${row.enabled}`
      }
    }
  ]

  return columns
}
