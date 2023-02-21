import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'

import { showActionModal, StepsForm, Table, TableProps } from '@acx-ui/components'
import {
  Acl,
  AclRule,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { ACLSettingDrawer } from './ACLSettingDrawer'


export const defaultStandardRuleList = {
  id: '',
  sequence: 65000,
  action: 'permit',
  source: 'any',
  specificSrcNetwork: ''
}

export const defaultExtendedRuleList = {
  id: '',
  sequence: 65000,
  action: 'permit',
  source: 'any',
  specificSrcNetwork: '',
  protocol: 'ip',
  sourcePort: '',
  destination: 'any',
  destinationPort: '',
  specificDestNetwork: ''
}

export function AclSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData, editMode } = useContext(ConfigurationProfileFormContext)
  const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
  const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  useEffect(() => {
    if(currentData.acls && editMode){
      form.setFieldValue('acls', currentData.acls)
      setAclsTable(currentData.acls)
    }
  }, [currentData])

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

  const rowActions: TableProps<Acl>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setDrawerFormRule(selectedRows[0])
        setDrawerEditMode(true)
        setDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ name }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'ACL' }),
            entityValue: name
          },
          onOk: async () => {
            const acls = aclsTable?.filter(row => {
              return row.name !== name
            })
            setAclsTable(acls)
            form.setFieldValue('acls', acls)
            clearSelection()
          }
        })
      }
    }
  ]

  const handleSetRule = (data: Acl) => {
    const isExist = aclsTable.filter((item: { name:string }) => item.name === data.name)
    if(drawerEditMode && isExist.length > 0){
      const acl = aclsTable.map((item: { name:string }) => {
        if(item.name === data.name){
          return { ...data }
        }
        return item
      })
      setAclsTable(acl as Acl[])
      form.setFieldValue('acls', acl)
    }else{
      setAclsTable([...aclsTable, data])
      form.setFieldValue('acls', [...aclsTable, data])
    }
    return true
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsForm.Title children={$t({ defaultMessage: 'ACLs' })} />
          <Table
            rowKey='name'
            rowActions={rowActions}
            columns={aclsColumns}
            dataSource={aclsTable}
            actions={[{
              label: $t({ defaultMessage: 'Add ACL' }),
              onClick: () => {
                setDrawerFormRule({
                  id: '',
                  name: '',
                  aclType: 'standard',
                  aclRules: [defaultStandardRuleList] as AclRule[]
                })
                setDrawerEditMode(false)
                setDrawerVisible(true)
              }
            }]}
            rowSelection={{
              type: 'radio',
              onChange: () => {
                setDrawerVisible(false)
              }
            }}
          />
        </Col>
      </Row>
      <ACLSettingDrawer
        editMode={drawerEditMode}
        rule={(drawerFormRule)}
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        setRule={handleSetRule}
        aclsTable={aclsTable} />
      <Form.Item name='acls' initialValue={aclsTable} />
    </>
  )
}