import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form, Input } from 'antd'

import { showActionModal, StepsFormLegacy, Table, TableProps } from '@acx-ui/components'
import {
  Acl,
  defaultSort,
  sortProp,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { getIntl }        from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import { PortProfileModal } from './PortProfileModal'

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

export function PortProfileSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const [ aclsTable, setAclsTable ] = useState<Acl[]>([])
  const [ portModalVisible, setPortModalVisible ] = useState(false)

  useEffect(() => {
    if(currentData.acls){
      form.setFieldValue('acls', currentData.acls)
      setAclsTable(currentData.acls)
    }
  }, [currentData])

  const aclsColumns: TableProps<Acl>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'name',
    key: 'name',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('name', defaultSort) }
  }, {
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'aclType',
    key: 'aclType',
    sorter: { compare: sortProp('aclType', defaultSort) },
    render: (_, { aclType }) => transformTitleCase(aclType)
  }]

  const rowActions: TableProps<Acl>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: () => {
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

  const onCancel = () => {
    setPortModalVisible(false)
  }

  const onSave = () => {
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'Port Profile' })} />
          <Table
            rowKey='name'
            rowActions={filterByAccess(rowActions)}
            columns={aclsColumns}
            dataSource={aclsTable}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add Port Profile' }),
              onClick: () => {
                setPortModalVisible(true)
              }
            }])}
          />
        </Col>
      </Row>
      <PortProfileModal
        visible={portModalVisible}
        onCancel={onCancel}
        onSave={onSave}
      />
      <Form.Item
        name='acls'
        initialValue={aclsTable}
        hidden={true}
        children={<Input />}
      />
    </>
  )
}
