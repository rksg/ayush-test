import { Key, useEffect, useState } from 'react'

import { Alert, Space, Spin, Tooltip } from 'antd'
import { ExpandableConfig }            from 'antd/lib/table/interface'
import { has }                         from 'lodash'
import { useIntl }                     from 'react-intl'
import { useParams }                   from 'react-router-dom'

import {
  Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { CancelCircle }                                        from '@acx-ui/icons'
import { useGetMspEcListQuery, useGetMspEcVenuesListMutation } from '@acx-ui/msp/services'
import { MspEcWithVenue }                                      from '@acx-ui/msp/utils'
import { AccountType }                                         from '@acx-ui/utils'

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

export const NewSelectCustomerDrawer = (props: SelectCustomerDrawerProps) => {
  const { $t } = useIntl()

  const { visible, selected, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspEcWithVenue[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>([])
  const [expansionStatus, setExpansionStatus] = useState<Record<React.Key, {
    isLoading: boolean;
    error: Error | null;
    attemptedFetch: boolean; // To know if we've tried fetching at least once
}>>({})


  const [customerList, setCustomerList] = useState<MspEcWithVenue[]>()

  const params = useParams()

  function getSelectedKeys (selected: MspEcWithVenue[]) {
    const customers = selected.filter(ec => !ec.allVenues
      && ec.children?.some(venue => venue.selected))
    const venueIds = customers.flatMap(ec => ec.children).filter(venue => venue.selected)
      .map(venue => venue.id)
    const custIdsWithAllSelVenues = selected.filter(ec => (!ec.children || ec.allVenues))
      .map(ec => ec.id)
    return venueIds.concat([...venueIds, ...custIdsWithAllSelVenues])
  }

  const { data: _customerList, isLoading, isFetching } = useGetMspEcListQuery({
    params, payload: customerListPayload })

  const [getMspEcsVenuesList] = useGetMspEcVenuesListMutation()

  const venuePayload = {
    fields: ['name', 'country', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }

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
    const customerIds = customerList?.map(ec => ec.id)
    // If no change in selected venues was made, return unchanged selectedRows
    // This covers scenario where selectedRows does not need to be transformed into MspEcWithVenue[] type
    // i.e. each element in array is a customer and not just a selected venue object
    if (selectedRows.every(item => customerIds?.includes(item.id) && !(item.children))) {
      const _selectedRows = selectedRows.map(item => ({ ...item, allVenues: true }))
      return _selectedRows
    }

    // eslint-disable-next-line max-len
    const _ecsWithVenues = selectedRows.map((item) => {
      if (item.isFirstLevel && (!item.children || item.children?.every(venue => venue.selected))) {
        return { ...item, allVenues: true }
      }
      return item
    })

    const _selectedRows = [..._ecsWithVenues]

    return _selectedRows
  }

  const columns: TableProps<MspEcWithVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend',
      index: 2
    }
  ]

  useEffect(() => {
    if (_customerList?.data) {
      const _customers: MspEcWithVenue[] = _customerList?.data.map(customer => {
        if (selected.length) {
          const currentCustomer = selected.filter(item =>customer.id === item.id)[0]
          if(currentCustomer) {
            return { ...currentCustomer,
              isFirstLevel: true }
          }
        }
        return { ...customer, isFirstLevel: true }
      })
      setCustomerList(_customers)
    } else if (!_customerList?.data && !isLoading && !isFetching) {
      setCustomerList([])
    }
  }, [_customerList?.data])

  useEffect(() => {
    if (customerList) {
      if(selected.length) { // if edit mode
        const _selected = selectedRows.length ? selectedRows : selected
        const selectKeys = getSelectedKeys(_selected)
        setSelectedKeys(selectKeys)
        setSelectedRows(_selected)
        setTotalCount(_selected.length)
      }
    }
  }, [customerList])


  const updateListStateOnExpand = (ecTenantId: string,
    newChildren?: MspEcWithVenue['children']) => {
    setCustomerList((prevCustomerList: MspEcWithVenue[] = []) => {
      return prevCustomerList.map(customer => {
        if (newChildren && customer.id === ecTenantId) {
          return {
            ...customer,
            isFirstLevel: true,
            children: newChildren
          }
        }
        return customer
      })
    })
  }

  const updateListStateonSelection = (selectedCustomerRows: MspEcWithVenue[]) => {
    setCustomerList((prevCustomerList: MspEcWithVenue[] = []) => {
      return prevCustomerList.map(customer => {
        const selectedCustomer = selectedCustomerRows.find(item => item.id === customer.id)
        return selectedCustomer || customer
      })
    })
  }

  const onRowSelectionChange = (selectedRowKeys: Key[], selRows: MspEcWithVenue[]) => {
    // remove children entry and update its parent
    const _customers = mapVenuesToCustomers(selRows)
    const selectedCustomerRows = getSelectedVenues(_customers)
    setSelectedRows(selectedCustomerRows)
    setSelectedKeys(selectedRowKeys)
    setTotalCount(selectedCustomerRows.length)
    updateListStateonSelection(selectedCustomerRows)
  }

  const mapVenuesToCustomers = (selRows: MspEcWithVenue[]) => {
  // Separate customers and venues for efficient processing.
    const customers: MspEcWithVenue[] = selRows.filter(item => item?.isFirstLevel)
    // eslint-disable-next-line max-len
    const venues = selRows.filter(item => !item.isFirstLevel)

    // Create a map of customers for quick lookup by their ID.
    const customerMap = new Map(customers.map(customer => [customer.id, customer]))

    // Iterate over the venues and assign them to the correct customer.
    for (const venue of venues) {
      const customer = customerMap.get(venue?.ecId as string)
      if (customer) {
      // If the customer's children array doesn't already include the venue, add it.
        if (!customer.children?.some(child => child.id === venue.id)) {
          customer.children?.push({ name: venue.name,
            id: venue.id, ecId: venue.ecId, selected: true })
        } else {
          customer.children?.map(child => {
            if (child.id === venue.id) {
              child.selected = true
            }
            return child
          })
        }
      } else {
        const cust = customerList?.filter(item => item.id === venue.ecId) as MspEcWithVenue[]
        const _child = cust[0]?.children?.map(child => ({
          ...child, selected: child.id === venue.id }))

        customers.push({ ...cust[0], children: _child,
          allVenues: _child?.every(item => item.selected) })
      }
    }

    return customers
  }


  const handleExpand = async (expanded: boolean, record: MspEcWithVenue) => {
    const ecTenantId = record.id
    if (expanded) {
      const currentStatus = expansionStatus[ecTenantId]

      const needsFetch = (!currentStatus || currentStatus.error) && !currentStatus?.isLoading

      if (needsFetch) {
        setExpansionStatus(prev => ({
          ...prev,
          [ecTenantId]: { isLoading: true, error: null, attemptedFetch: false }
        }))

        try {
          const { data: venuesListResponse } = await getMspEcsVenuesList({
            params,
            payload: venuePayload,
            ecTenantId
          })
          const venuesData = venuesListResponse?.data || []


          const newChildren: MspEcWithVenue['children'] = venuesData.map(venue => ({
            id: venue.id,
            name: venue.name,
            selected: !!record?.allVenues,
            ecId: ecTenantId
          }))

          updateListStateOnExpand(ecTenantId, newChildren)

          setExpansionStatus(prev => ({
            ...prev,
            [ecTenantId]: { isLoading: false, error: null, attemptedFetch: true }
          }))

        } catch (error) {
          setExpansionStatus(prev => ({
            ...prev,
            [ecTenantId]: { isLoading: false, error: error as Error, attemptedFetch: true }
          }))
          // Optionally clear children in dataSource on error to prevent showing stale data
          setCustomerList((prevCustomerList) => {
            return prevCustomerList?.map(customer => {
              if (customer.id === ecTenantId) {
                return { ...customer, children: [], isFirstLevel: true, isUnauthorizedAccess: true }
              }
              return customer
            })
          })
        }
      }
    }
  }

  const expandableConfig: ExpandableConfig<MspEcWithVenue> = {
    expandedRowKeys: expandedRowKeys as React.Key[],
    onExpand: handleExpand,
    rowExpandable: (record: MspEcWithVenue) => {
      return has(record, 'children')
    },
    expandedRowClassName: (record) => {
      const status = expansionStatus[record.id]
      if (status?.isLoading || status?.error) {
        return '' // Apply class to hide if loading or error
      } else {
        return 'expanded-row-hidden'
      }
    },
    expandedRowRender: (record) => {
      const status = expansionStatus[record.id]

      const placeholderCellStyle = {
        padding: '16px', textAlign: 'center' as const, minHeight: '50px' }

      if (record.children && record.children.length > 0 && !status?.isLoading && !status?.error) {
        return null
      }
      if (status?.isLoading) {
        return <div style={placeholderCellStyle}><Spin /></div>
      }

      if (status?.error) {
        return <div style={{ ...placeholderCellStyle, textAlign: 'left' as const }}>
          <Alert message={status.error.message} type='error' showIcon /></div>
      }

      if (status?.attemptedFetch && !status.isLoading && !status.error
        && (!record.children || record.children.length === 0)) {
        return <div style={placeholderCellStyle}>{
          $t({ defaultMessage: 'No <venuePlural></venuePlural> found.' }) }</div>
      }

      return null
    },
    onExpandedRowsChange: (keys) => {
      setExpandedRowKeys(keys as React.Key[])
    }
  }
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
          settingsId='select-customer-drawer'
          columns={columns}
          dataSource={customerList}
          indentSize={20}
          rowKey='id'
          expandIconColumnIndex={1}
          expandable={expandableConfig}
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
              onRowSelectionChange(selectedRowKeys, selRows)
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
