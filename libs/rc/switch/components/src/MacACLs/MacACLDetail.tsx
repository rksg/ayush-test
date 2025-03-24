import React, { useEffect, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Drawer,
  Table,
  TableProps
} from '@acx-ui/components'
import { MacAcl, MacAclRule } from '@acx-ui/rc/utils'

interface MacACLDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  macACLData: MacAcl
}

export const MacACLDetail: React.FC<MacACLDrawerProps> = ({
  visible,
  setVisible,
  macACLData
}) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [dataSource, setDataSource] = useState<MacAclRule[]>()


  function useColumns () {
    const columns: TableProps<MacAclRule>['columns'] = [
      {
        key: 'action',
        title: $t({ defaultMessage: 'Action' }),
        dataIndex: 'action'
      },
      {
        key: 'sourceAddress',
        title: $t({ defaultMessage: 'Source MAC Address' }),
        dataIndex: 'sourceAddress'
      },
      {
        key: 'sourceMask',
        title: $t({ defaultMessage: 'Mask' }),
        dataIndex: 'sourceMask'
      },
      {
        key: 'destinationAddress',
        title: $t({ defaultMessage: 'Dest.  MAC Address' }),
        dataIndex: 'destinationAddress'
      },
      {
        key: 'destinationMask',
        title: $t({ defaultMessage: 'Dest. Mask' }),
        dataIndex: 'destinationMask'
      }
    ]
    return columns
  }

  useEffect(() => {
    if (macACLData) {
      form.setFieldValue('name', macACLData.name)

      if (macACLData.switchMacAclRules && macACLData.switchMacAclRules.length > 0) {
        const formattedRules = macACLData.switchMacAclRules.map((rule, index) => ({
          key: `${index}`,
          action: rule.action || 'permit',
          sourceAddress: rule.sourceAddress || '',
          sourceMask: rule.sourceMask || '',
          destinationAddress: rule.destinationAddress || '',
          destinationMask: rule.destinationMask || ''
        }))
        setDataSource(formattedRules)
      }
    }
  }, [macACLData, form])

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'View MAC ACL' })}
      visible={visible}
      onClose={onClose}
      width={1000}
    >
      <Form
        layout='vertical'
        form={form}
      >
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'MAC ACL Name' })}
        >
          <div>
            {macACLData?.name || ''}
          </div>
        </Form.Item>
        <Form.Item
          name='switchMacAclRules'
          label={$t({ defaultMessage: 'Rules' })}
        >
          <Table
            dataSource={dataSource}
            columns={useColumns()}
            rowKey='key'
          />
        </Form.Item>
      </Form>
    </Drawer>
  )
}