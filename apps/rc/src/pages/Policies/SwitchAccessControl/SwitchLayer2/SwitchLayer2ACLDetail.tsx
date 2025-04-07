import React from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { useGetLayer2AclRulesQuery } from '@acx-ui/rc/services'
import { MacAclRule, useTableQuery } from '@acx-ui/rc/utils'

interface MacACLDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  aclName: string
  accessControlId: string
}

export const SwitchLayer2ACLDetail: React.FC<MacACLDrawerProps> = ({
  visible,
  setVisible,
  aclName,
  accessControlId
}) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const settingsId = 'switch-access-control-overview'

  const defaultPayload = {
    fields: [
      'id',
      'action',
      'sourceAddress',
      'sourceMask',
      'destinationAddress',
      'destinationMask',
      'macAclId'
    ],
    pagination: { settingsId }
  }

  const tableQuery = useTableQuery<MacAclRule>({
    useQuery: useGetLayer2AclRulesQuery,
    apiParams: { accessControlId: accessControlId || '' },
    defaultPayload,
    sorter: { sortField: 'id', sortOrder: 'ASC' }
  })

  function useColumns () {
    const columns: TableProps<MacAclRule>['columns'] = [
      {
        key: 'action',
        title: $t({ defaultMessage: 'Action' }),
        dataIndex: 'action',
        render: (_, row) => {
          return row.action === 'permit' ?
            $t({ defaultMessage: 'Permit' }) : $t({ defaultMessage: 'Deny' })
        }
      },
      {
        key: 'sourceAddress',
        title: $t({ defaultMessage: 'Source MAC Address' }),
        dataIndex: 'sourceAddress',
        render: (_, row) => {
          return row.sourceAddress === 'any' ?
            $t({ defaultMessage: 'Any' }) : row.sourceAddress
        }
      },
      {
        key: 'sourceMask',
        title: $t({ defaultMessage: 'Mask' }),
        dataIndex: 'sourceMask'
      },
      {
        key: 'destinationAddress',
        title: $t({ defaultMessage: 'Dest.  MAC Address' }),
        dataIndex: 'destinationAddress',
        render: (_, row) => {
          return row.destinationAddress === 'any' ?
            $t({ defaultMessage: 'Any' }) : row.destinationAddress
        }
      },
      {
        key: 'destinationMask',
        title: $t({ defaultMessage: 'Dest. Mask' }),
        dataIndex: 'destinationMask'
      }
    ]
    return columns
  }

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'L2 Settings' })}
      visible={visible}
      onClose={onClose}
      width={1000}
    >
      <Loader states={[tableQuery]}>
        <Form
          layout='vertical'
          form={form}
        >
          <Form.Item>
            <div>{aclName}</div>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Rules' })}>
            <Table<MacAclRule>
              settingsId={settingsId}
              columns={useColumns()}
              dataSource={tableQuery.data?.data}
              pagination={tableQuery.pagination}
              onChange={tableQuery.handleTableChange}
              rowKey='switchId'
              onFilterChange={tableQuery.handleFilterChange}
            />
          </Form.Item>
        </Form>
      </Loader>
    </Drawer>
  )
}