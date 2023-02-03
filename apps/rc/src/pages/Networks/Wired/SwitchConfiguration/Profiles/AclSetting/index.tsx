import { useEffect, useState } from 'react'

import { Row, Col } from 'antd'

import { StepsForm, Table, TableProps } from '@acx-ui/components'
import { useSwitchConfigProfileQuery }  from '@acx-ui/rc/services'
import {
  Acl,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { ACLSettingDrawer } from './ACLSettingDrawer'

export function AclSetting () {
  const { $t } = getIntl()
  const params = useParams()
  const { data } = useSwitchConfigProfileQuery({ params }, { skip: !params.profileId })
  const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
  const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  useEffect(() => {
    if(data?.acls){
      setAclsTable(data?.acls)
    }
  }, [data?.acls])

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

  const handleSetRule = (data: Acl) => {
    return true
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsForm.Title children={$t({ defaultMessage: 'ACLs' })} />
          <Table
            rowKey='id'
            columns={aclsColumns}
            dataSource={aclsTable}
            actions={[{
              label: 'Add ACL',
              onClick: () => {
                setDrawerVisible(true)
              }
            }]}
          />
        </Col>
      </Row>
      <ACLSettingDrawer
        editMode={drawerEditMode}
        rule={(drawerFormRule)}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        setRule={handleSetRule} />
    </>
  )
}