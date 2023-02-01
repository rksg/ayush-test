import { Row, Col } from 'antd'

import { Table, TableProps }           from '@acx-ui/components'
import { StepsForm }                   from '@acx-ui/components'
import { useSwitchConfigProfileQuery } from '@acx-ui/rc/services'
import {
  Vlan,
  SwitchModel,
  SpanningTreeProtocolName,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

export function VlanSetting () {
  const { $t } = getIntl()
  const params = useParams()
  const { data } = useSwitchConfigProfileQuery({ params }, { skip: !params.profileId })

  const vlansColumns: TableProps<Vlan>['columns']= [{
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    key: 'vlanId'
  }, {
    title: $t({ defaultMessage: 'VLAN Name' }),
    dataIndex: 'vlanName',
    key: 'vlanName'
  }, {
    title: $t({ defaultMessage: 'IGMP Snooping' }),
    dataIndex: 'igmpSnooping',
    key: 'igmpSnooping',
    render: (data) => transformTitleCase(data as string)
  }, {
    title: $t({ defaultMessage: 'Multicast Version' }),
    dataIndex: 'multicastVersion',
    key: 'multicastVersion'
  }, {
    title: $t({ defaultMessage: 'Spanning Tree' }),
    dataIndex: 'spanningTreeProtocol',
    key: 'spanningTreeProtocol',
    render: (data) => {
      return data ? SpanningTreeProtocolName[data as keyof typeof SpanningTreeProtocolName] : null
    }
  }, {
    title: $t({ defaultMessage: '# of Ports' }),
    dataIndex: 'switchFamilyModels',
    key: 'switchFamilyModels',
    render: (data) => {
      return data
        ? (data as Vlan['switchFamilyModels'])?.reduce((result:number, row: SwitchModel) => {
          const taggedPortsCount = row.taggedPorts?.split(',').length ?? 0
          const untaggedPortsCount = row?.untaggedPorts?.split(',').length ?? 0
          return result + taggedPortsCount + untaggedPortsCount
        }, 0)
        : 0
    }
  }]

  return (
    <Row gutter={20}>
      <Col span={20}>
        <StepsForm.Title children={$t({ defaultMessage: 'VLANs' })} />
        <Table
          rowKey='id'
          columns={vlansColumns}
          dataSource={data?.vlans}
          actions={[{
            label: 'Add VLAN',
            onClick: () => {}
          },{
            label: 'Default VLAN settings',
            onClick: () => {}
          }]}
        />
      </Col>
    </Row>
  )
}