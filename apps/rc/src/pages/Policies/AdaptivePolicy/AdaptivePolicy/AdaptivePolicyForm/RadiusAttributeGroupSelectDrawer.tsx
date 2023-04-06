import React, { useState } from 'react'

import { Form, FormInstance } from 'antd'
import {  useIntl }           from 'react-intl'

import { Card, Descriptions, Drawer, Loader, Table, TableProps }    from '@acx-ui/components'
import { useRadiusAttributeGroupListQuery }                         from '@acx-ui/rc/services'
import { AttributeAssignment, RadiusAttributeGroup, useTableQuery } from '@acx-ui/rc/utils'
import { filterByAccess }                                           from '@acx-ui/user'

import { RadiusAttributeGroupFormDrawer } from './RadiusAttributeGroupFormDrawer'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  settingForm: FormInstance
}

function useColumns () {
  const { $t } = useIntl()
  const getAttributes = function (attributes: Partial<AttributeAssignment> []) {
    const rows = []
    if(attributes) {
      for (const attribute of attributes) {
        rows.push(
          <Descriptions.Item key={attribute.attributeName}
            label={attribute.attributeName}
            children={attribute.attributeValue}/>
        )
      }
    }
    return rows
  }

  const columns: TableProps<RadiusAttributeGroup>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name',
      render: function (data, row) {
        return (
          <Card title={row.name} type='no-border'>
            <Descriptions labelWidthPercent={30}>
              {getAttributes(row.attributeAssignments)}
            </Descriptions>
          </Card>
        )
      }
    }
  ]
  return columns
}

export function RadiusAttributeGroupSelectDrawer (props: RadiusAttributeDrawerProps) {
  const { $t } = useIntl()

  const { visible, setVisible, settingForm } = props
  const [selectedGroup, setSelectedGroup ] = useState({} as RadiusAttributeGroup)
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // eslint-disable-next-line max-len
  const [radiusAttributeGroupFormDrawerVisible, setRadiusAttributeGroupFormDrawerVisible] = useState(false)

  const tableQuery = useTableQuery({
    useQuery: useRadiusAttributeGroupListQuery,
    defaultPayload: {}
  })

  const onClose = () => {
    setSelectedRowKeys([])
    setVisible(false)
    form.resetFields()
  }

  const onSelectChange = (keys: React.Key[], rows: RadiusAttributeGroup[]) => {
    if(rows.length > 0) {
      form.setFieldValue('attributeId', rows[0].id)
      setSelectedGroup(rows[0])
    } else{
      form.resetFields()
    }
  }

  const onSubmit = () => {
    settingForm.setFieldValue('attributeGroupId', selectedGroup.id)
    onClose()
  }

  const footer = (
    <Drawer.FormFooter
      onCancel={() => {
        onClose()
      }}
      buttonLabel={{
        save: $t({ defaultMessage: 'Select' })
      }}
      onSave={async () => {
        form.submit()
      }}
    />
  )

  const content = (
    <Form form={form} onFinish={onSubmit}>
      <Form.Item name='attributeId'
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please select group' })
          }]
        }
      >
        <Loader states={[tableQuery]}>
          <Table
            columns={useColumns()}
            dataSource={tableQuery.data?.data}
            showHeader={false}
            rowSelection={{
              type: 'radio',
              onChange: onSelectChange,
              selectedRowKeys: selectedRowKeys }}
            rowKey='id'
            type={'form'}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add Group' }),
              onClick: () => {
                setRadiusAttributeGroupFormDrawerVisible(true)
              }
            }])}
          />
        </Loader>
      </Form.Item>
    </Form>
  )

  return (
    <>
      <Drawer
        title={$t({ defaultMessage: 'Select RADIUS Attribute Group' })}
        visible={visible}
        onClose={onClose}
        children={content}
        footer={footer}
        width={600}
      />
      <RadiusAttributeGroupFormDrawer
        visible={radiusAttributeGroupFormDrawerVisible}
        setVisible={setRadiusAttributeGroupFormDrawerVisible}
      />
    </>
  )
}
