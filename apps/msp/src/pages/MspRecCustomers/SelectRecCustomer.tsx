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
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
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
  multiSelectionEnabled: boolean
}

export const SelectRecCustomerDrawer = (props: SelectRecCustomerDrawerProps) => {
  const { $t } = useIntl()
  const mspUtils = MSPUtils()

  const { visible, setVisible, setSelected, multiSelectionEnabled } = props
  const [resetField, setResetField] = useState(false)
  const [selectedRows, setSelectedRows] = useState<MspRecCustomer[]>([])
  const MAX_ALLOWED_SELECTED_PROPERTIES = 100
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isRecToMspREcConversionEnabled =
    useIsSplitOn(Features.DURGA_TENANT_CONVERSION_REC_TO_MSP_REC)

  const queryResults = useGetAvailableMspRecCustomersQuery({ params: useParams(),
    enableRbac: isRbacEnabled })

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
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return row?.is_tenant_onboarded
          ? <span
            style={{ fontWeight: 'bold' }}>
            { row.account_name }
            <span style={{
              color: 'var(--acx-accents-orange-50)',
              paddingLeft: '4px'
            }}>*</span>
          </span>
          : row.account_name
      }
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
            type: multiSelectionEnabled ? 'checkbox' : 'radio',
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            }
          }}
        />
      </Loader>
    </Space>

  const footer =<div>
    <div style={
      {
        marginBottom: '18px',
        display: 'flex',
        flexDirection: 'column'
      }
    }>
      {selectedRows.length > MAX_ALLOWED_SELECTED_PROPERTIES &&
      <label style={{
        color: 'var(--acx-semantics-red-40)',
        marginBottom: '4px'
      }}>{$t({ defaultMessage:
        'Maximum allowed selection is {MAX_ALLOWED_SELECTED_PROPERTIES}' },
        { MAX_ALLOWED_SELECTED_PROPERTIES })}</label>}

      { isRecToMspREcConversionEnabled && <label>{ $t({ defaultMessage: 'Property names with' }) }
        <span style={{
          color: 'var(--acx-accents-orange-50)',
          margin: '0 4px'
        }}>*</span>
        { $t({ defaultMessage: 'have RUCKUS One subscription but haven’t been onboarded.' })}
      </label> }
    </div>

    <Button
      disabled={selectedRows.length === 0 || selectedRows.length > MAX_ALLOWED_SELECTED_PROPERTIES}
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
      title={$t({ defaultMessage: 'Manage Brand Property' })}
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
