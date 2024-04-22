import { Key, useEffect, useState } from 'react'

import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { useGetMspEcWithVenuesListQuery } from '@acx-ui/msp/services'
import { MspEcWithVenue }                 from '@acx-ui/msp/utils'
import { AccountType }                    from '@acx-ui/utils'

import * as UI from '../styledComponents'

interface SelectCustomerDrawerProps {
  visible: boolean
  selected: MspEcWithVenue[]
  tenantIds?: string[]
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspEcWithVenue[]) => void
}

const customerListPayload = {
  fields: ['name', 'id'],
  filters: {
    tenantType: [AccountType.MSP_EC, AccountType.MSP_REC,
      AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER]
  },
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const SelectCustomerDrawer = (props: SelectCustomerDrawerProps) => {
  const { $t } = useIntl()

  const { visible, selected, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspEcWithVenue[]>([])

  function getSelectedKeys (mspEcs: MspEcWithVenue[], selected: MspEcWithVenue[]) {
    const selectedVenueIds = selected.flatMap(ec => ec.children).filter(venue => venue.selected)
      .map(venue => venue.id)
    const allVenueIds = mspEcs.flatMap(ec => ec.children.map(venue => venue.id))
    return selectedVenueIds.filter(id => allVenueIds.includes(id))
  }

  const { data: customerList }
  = useGetMspEcWithVenuesListQuery({ params: useParams(), payload: customerListPayload })

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
    setSelectedKeys([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const handleSave = () => {
    const selectedVenues = getSelectedVenues(selectedRows)
    setSelected(selectedVenues ?? [])
    resetFields()
    setVisible(false)
  }

  const getSelectedVenues = (selectedRows: MspEcWithVenue[]) => {
    const selVenueIds = selectedRows.filter(item => !item.isFirstLevel).map(venue => venue.id)
    const ecsWithSelVenues: MspEcWithVenue[] = customerList?.data.filter(ec =>
      ec.children.some(venue => selVenueIds.includes(venue.id))) ?? []
    return ecsWithSelVenues.map(ec => {
      return {
        ...ec,
        children: ec.children.map(venue => {
          return {
            ...venue,
            selected: selVenueIds.includes(venue.id)
          }
        })
      }
    })
  }

  const columns: TableProps<MspEcWithVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend'
    }
  ]

  useEffect(() => {
    if (customerList?.data) {
      const selectKeys = getSelectedKeys(customerList?.data as MspEcWithVenue[], selected)
      setSelectedKeys(selectKeys)
    }
  }, [customerList?.data])

  const content =
  <UI.ExpanderTableWrapper>
    <Space direction='vertical'>
      <Loader >
        <Table
          columns={columns}
          dataSource={customerList?.data}
          indentSize={20}
          rowKey='id'
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
              setSelectedKeys(selectedRowKeys.filter(id =>
                !customerList?.data.map(ec => ec.id).includes(id as string)))
            },
            checkStrictly: false
          }}
        />
      </Loader>
    </Space>
  </UI.ExpanderTableWrapper>

  const footer =<div>
    <Button
      disabled={selectedRows.length === 0}
      onClick={() => handleSave()}
      type='primary'
    >
      {$t({ defaultMessage: 'Save Selection' })}
    </Button>

    <Button onClick={() => {
      setVisible(false)
    }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Customers' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={445}
    >
      {content}
    </Drawer>
  )
}
