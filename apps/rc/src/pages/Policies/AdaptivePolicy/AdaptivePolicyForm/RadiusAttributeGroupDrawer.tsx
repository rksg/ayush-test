import React, { useState } from 'react'

import { Form }     from 'antd'
import {  useIntl } from 'react-intl'

import { Card, Descriptions, Drawer, Table, TableProps }            from '@acx-ui/components'
import { useRadiusAttributeGroupListQuery }                         from '@acx-ui/rc/services'
import { AttributeAssignment, RadiusAttributeGroup, useTableQuery } from '@acx-ui/rc/utils'

interface RadiusAttributeDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void,
  setRadiusAttributeGroup: (attribute: RadiusAttributeGroup) => void,
  setRadiusAttributeGroupFormDrawerVisible: (visible: boolean) => void
}

function useColumns () {
  const { $t } = useIntl()
  const getAttributes = function (attributes: Partial<AttributeAssignment> []) {
    const rows = []
    if(attributes) {
      for (const attribute of attributes) {
        rows.push(
          <Descriptions.Item
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

export function RadiusAttributeGroupDrawer (props: RadiusAttributeDrawerProps) {
  const { $t } = useIntl()
  // eslint-disable-next-line max-len
  const { visible, setVisible, setRadiusAttributeGroup, setRadiusAttributeGroupFormDrawerVisible } = props
  const [selectedGroup, setSelectedGroup ] = useState({} as RadiusAttributeGroup)
  const [form] = Form.useForm()

  const tableQuery = useTableQuery({
    useQuery: useRadiusAttributeGroupListQuery,
    defaultPayload: {}
  })

  const onClose = () => {
    setVisible(false)
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
    setRadiusAttributeGroup(selectedGroup)
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
        <Table
          columns={useColumns()}
          dataSource={tableQuery.data?.data}
          showHeader={false}
          rowSelection={{ type: 'radio', onChange: onSelectChange }}
          rowKey='id'
          type={'form'}
          actions={[{
            label: $t({ defaultMessage: 'Add Group' }),
            onClick: () => {
              setRadiusAttributeGroupFormDrawerVisible(true)
            }
          }]}
        />
      </Form.Item>
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Select RADIUS Attribute Group' })}
      visible={visible}
      onClose={onClose}
      children={content}
      footer={footer}
      width={600}
    />
  )
}
