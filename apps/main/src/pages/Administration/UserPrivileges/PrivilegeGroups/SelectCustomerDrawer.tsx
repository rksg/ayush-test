import { Key, useEffect, useState } from 'react'

import { Space, Tooltip } from 'antd'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { CancelCircle }                   from '@acx-ui/icons'
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
  const [totalCount, setTotalCount] = useState<number>(0)

  function getSelectedKeys (selected: MspEcWithVenue[]) {
    const customers = selected.filter(ec => !ec.allVenues
      && ec.children?.some(venue => venue.selected))
    const venueIds = customers.flatMap(ec => ec.children).filter(venue => venue.selected)
      .map(venue => venue.id)
    const custIdsWithAllSelVenues = selected.filter(ec => ec.allVenues).map(ec => ec.id)
    const allSelectedVenueIds = customerList?.data
      .filter(ec => custIdsWithAllSelVenues.includes(ec.id))
      .flatMap(ec => ec.children)
      .filter(venue => venue)
      .map(venue => venue.id) ?? []
    return venueIds.concat(allSelectedVenueIds)
  }

  const { data: customerList, isLoading, isFetching }
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

  const clearSelection = () => {
    setSelectedRows([])
    setSelectedKeys([])
    setTotalCount(0)
  }

  const getSelectedVenues = (selectedRows: MspEcWithVenue[]) => {
    const customerIds = customerList?.data.map(ec => ec.id)
    // If no change in selected venues was made, return unchanged selectedRows
    // This covers scenario where selectedRows does not need to be transformed into MspEcWithVenue[] type
    // i.e. each element in array is a customer and not just a selected venue object
    if (selectedRows.every(item => customerIds?.includes(item.id))) {
      return selectedRows
    }
    const selVenueIds = selectedRows.filter(item => !item.isFirstLevel).map(venue => venue.id)
    const ecsWithSelVenues: MspEcWithVenue[] = customerList?.data.filter(ec =>
      ec.children?.some(venue => selVenueIds.includes(venue.id))) ?? []
    return ecsWithSelVenues.map(ec => {
      return {
        ...ec,
        allVenues: ec.children.every(venue => selVenueIds.includes(venue.id)),
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
      const selectKeys = getSelectedKeys(selected)
      setSelectedKeys(selectKeys)
      setSelectedRows(selected)
      setTotalCount(selected.length)
    }
  }, [customerList?.data])

  const content =
  <UI.ExpanderTableWrapper>
    <Space direction='vertical'>
      <Loader states={[
        { isLoading: isLoading,
          isFetching: isFetching
        }
      ]}>
        <UI.SelectedCount hidden={totalCount === 0}>
          {$t({ defaultMessage: '{totalCount} selected' }, {
            totalCount
          })}
          <CancelCircle
            style={{ marginLeft: '6px', marginBottom: '-4px' }}
            onClick={clearSelection}/>
        </UI.SelectedCount>
        <Table
          columns={columns}
          dataSource={customerList?.data}
          indentSize={20}
          rowKey='id'
          rowSelection={{
            renderCell (checked, record, index, node) {
              if (record.isUnauthorizedAccess) {
                return <Tooltip
                  title={$t({ defaultMessage:
                    'You are not authorized to manage this customer' })}>{node}</Tooltip>
              }
              return node
            },
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
              setSelectedKeys(selectedRowKeys)
              setTotalCount(getSelectedVenues(selRows).length)
            },
            checkStrictly: false
          }}
          rowClassName={customer => customer.isUnauthorizedAccess ? 'disabled-row' : ''}
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
