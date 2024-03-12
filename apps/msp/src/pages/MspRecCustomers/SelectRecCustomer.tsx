import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useGetAvailableMspRecCustomersQuery
} from '@acx-ui/msp/services'
import {
  MSPUtils,
  MspRecCustomer
} from '@acx-ui/msp/utils'
import { useParams } from '@acx-ui/react-router-dom'

interface SelectRecCustomerDrawerProps {
  visible: boolean
  tenantId?: string
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspRecCustomer[]) => void
}

export const SelectRecCustomerDrawer = (props: SelectRecCustomerDrawerProps) => {
  const { $t } = useIntl()
  const mspUtils = MSPUtils()

  const { visible, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedRows, setSelectedRows] = useState<MspRecCustomer[]>([])

  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn

  const queryResults = useGetAvailableMspRecCustomersQuery({ params: useParams() })

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const handleSave = () => {
    setSelected(selectedRows)
    resetFields()
    // setVisible(false)
  }

  const columns: TableProps<MspRecCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'Property Name' }),
      dataIndex: 'account_name',
      key: 'account_name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'billing_street',
      key: 'billing_street',
      sorter: true,
      render: function (_, row) {
        return mspUtils.transformMspRecAddress(row)
      }
    }
  ]

  const content =
    <Space direction='vertical'>
      <Loader states={[queryResults
      ]}>
        <Table
          settingsId='manage-ruckus-end-customer-table'
          columns={columns}
          dataSource={queryResults?.data?.child_accounts}
          rowKey='account_name'
          rowSelection={{
            type: 'radio',
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            }
          }}
        />
      </Loader>
    </Space>

  const footer =<div>
    <Button
      disabled={selectedRows.length === 0}
      onClick={() => handleSave()}
      type='primary'
    >
      {$t({ defaultMessage: 'Save' })}
    </Button>

    <Button onClick={() => {
      setVisible(false)
    }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={isHspSupportEnabled ? $t({ defaultMessage: 'Manage Brand Property' })
        : $t({ defaultMessage: 'Manage RUCKUS End Customer' })}
      subTitle={$t({ defaultMessage: 'Properties for {propertyOowner}' },
        { propertyOowner: queryResults?.data?.parent_account_name })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={750}
    >
      {content}
    </Drawer>
  )
}
