import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form, Input } from 'antd'

import { showActionModal, StepsFormLegacy, Table, TableProps } from '@acx-ui/components'
import {
  Acl,
  AclRule,
  defaultSort,
  sortProp,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'
import { getIntl }                   from '@acx-ui/utils'

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
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
  const [ drawerFormRule, setDrawerFormRule ] = useState<Acl>()
  const [ drawerEditMode, setDrawerEditMode ] = useState(false)
  const [ drawerVisible, setDrawerVisible ] = useState(false)

  useEffect(() => {
    if(currentData.acls){
      form.setFieldValue('acls', currentData.acls)
      setAclsTable(currentData.acls)
    }
  }, [currentData])

  const aclsColumns: TableProps<Acl>['columns']= [{
    title: $t({ defaultMessage: 'ACL Name' }),
    dataIndex: 'name',
    key: 'name',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'ACL Type' }),
    dataIndex: 'aclType',
    key: 'aclType',
    sorter: { compare: sortProp('aclType', defaultSort) },
    render: (_, { aclType }) => transformTitleCase(aclType)
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
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'ACLs' })} />
          <Table
            rowKey='name'
            rowActions={filterByAccess(rowActions)}
            columns={aclsColumns}
            dataSource={aclsTable}
            actions={filterByAccess([{
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
            }])}
            rowSelection={hasAccess() && {
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
      <Form.Item
        name='acls'
        initialValue={aclsTable}
        hidden={true}
        children={<Input />}
      />
    </>
  )
}
