import { Row, Col } from 'antd'

import { StepsForm, Table, TableProps } from '@acx-ui/components'
import { useSwitchConfigProfileQuery }  from '@acx-ui/rc/services'
import {
  Acl,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

export function AclSetting () {
  const { $t } = getIntl()
  const params = useParams()
  const { data } = useSwitchConfigProfileQuery({ params }, { skip: !params.profileId })

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

  return (
    <Row gutter={20}>
      <Col span={20}>
        <StepsForm.Title children={$t({ defaultMessage: 'VLANs' })} />
        <Table
          rowKey='id'
          columns={aclsColumns}
          dataSource={data?.acls}
          actions={[{
            label: 'Add ACL',
            onClick: () => {}
          }]}
        />
      </Col>
    </Row>
  )
}