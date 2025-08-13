import { Col, Form, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { Loader, StepsForm, Table, TableProps } from '@acx-ui/components'
import { useMspCustomerListQuery }              from '@acx-ui/msp/services'
import { MspEc }                                from '@acx-ui/msp/utils'
import { useEcFilters }                         from '@acx-ui/rc/utils'
import { AccountTier, useTableQuery }           from '@acx-ui/utils'

import { DescriptionWrapper } from '../../../styledComponents'

export const CustomerSelectionForm = () => {
  const { $t } = useIntl()

  return <>
    <Row>
      <Col span={24}>
        <StepsForm.Title>{$t({ defaultMessage: 'Select Customers' })}</StepsForm.Title>
      </Col>
    </Row>
    <Row>
      <Col span={24}>
        <DescriptionWrapper>
          <Typography.Text>
            {$t({
              defaultMessage: 'Select the customers this service will be applied to'
            })}
          </Typography.Text>
        </DescriptionWrapper>
      </Col>
    </Row>
    <Row >
      <Col span={24}>
        <Form.Item
          name='selectedCustomers'
        >
          <CustomerSelectionTableFormItem />
        </Form.Item>
      </Col>
    </Row>

  </>
}

interface CustomerSelectionTableFormItemProps {
  value?: string[]
  onChange?: (value: string[]) => void
}

const CustomerSelectionTableFormItem = (props: CustomerSelectionTableFormItemProps) => {
  const { value, onChange } = props
  const { $t } = useIntl()
  const ecFilters = useEcFilters()

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      filters: { ...ecFilters },
      mustNotMatchField: [{ field: 'accountTier', value: AccountTier.CORE }],
      fields: ['id', 'name', 'status', 'streetAddress', 'tenantType']
    },
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    }
  })

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table<MspEc>
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      settingsId='sdlan-customer-selection-table'
      rowKey='id'
      enableApiFilter={true}
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: value,
        onChange: (selectedRowKeys) => {
          onChange?.(selectedRowKeys as string[])
        }
      }}
      tableAlertRender={false}
    />
  </Loader>
}