import { Typography } from 'antd'

import { Modal, Table, TableProps }    from '@acx-ui/components'
import { useSwitchConfigProfileQuery } from '@acx-ui/rc/services'
import {
  Acl,
  Vlan,
  SwitchModel,
  VenueSwitchConfiguration,
  SpanningTreeProtocolName,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { FormState } from './index'

export function RegularProfileDetailModal (props: {
  formState: FormState,
  formData: VenueSwitchConfiguration,
  setFormState: (data: FormState) => void
}) {
  const { $t } = getIntl()
  const { tenantId } = useParams()
  const { formState, setFormState, formData } = props
  const { data } = useSwitchConfigProfileQuery({
    params: { tenantId, profileId: formData?.profileId?.[0] as string }
  })

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

  const aclsColumns: TableProps<Acl>['columns']= [{
    title: $t({ defaultMessage: 'ACL Name' }),
    dataIndex: 'name',
    key: 'name'
  }, {
    title: $t({ defaultMessage: 'ACL Type' }),
    dataIndex: 'aclType',
    key: 'aclType',
    render: (data) => transformTitleCase(data as string)
  }]

  const closeModal = () => {
    setFormState({
      ...formState,
      regularModalvisible: false
    })
  }

  return (<Modal
    title={$t({ defaultMessage: 'VLAN (L2) Profile Details' })}
    visible={formState?.regularModalvisible}
    width={900}
    cancelButtonProps={{ style: { display: 'none' } }}
    destroyOnClose={true}
    onOk={closeModal}
    onCancel={closeModal}
  >
    <Typography.Text style={{ display: 'block', marginBottom: '10px' }}>
      {$t({ defaultMessage: 'Profile Name' })}: {data?.name}
    </Typography.Text>
    <Typography.Text>
      {$t({ defaultMessage: 'VLANs' })} ({data?.vlans?.length ?? 0 })
    </Typography.Text>
    <Table
      rowKey='id'
      columns={vlansColumns}
      dataSource={data?.vlans}
    />
    <Typography.Text style={{ display: 'inline-block', marginTop: '20px' }}>
      {$t({ defaultMessage: 'ACLs' })} ({ data?.acls?.length ?? 0 })
    </Typography.Text>
    <Table
      rowKey='id'
      columns={aclsColumns}
      dataSource={data?.acls}
    />
  </Modal>)
}