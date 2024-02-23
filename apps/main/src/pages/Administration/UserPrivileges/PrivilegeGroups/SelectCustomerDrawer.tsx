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
import { useMspCustomerListQuery } from '@acx-ui/msp/services'
import { MspEc }                   from '@acx-ui/msp/utils'

interface SelectCustomerDrawerProps {
  visible: boolean
  selected: MspEc[]
  tenantIds?: string[]
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspEc[]) => void
}

const customerListPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}


export const SelectCustomerDrawer = (props: SelectCustomerDrawerProps) => {
  const { $t } = useIntl()

  const { visible, selected, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspEc[]>([])

  function getSelectedKeys (mspEcs: MspEc[], ecId: string[]) {
    return mspEcs.filter(rec => ecId.includes(rec.id)).map(rec => rec.id)
  }

  function getSelectedRows (mspEcs: MspEc[], ecId: string[]) {
    return mspEcs.filter(rec => ecId.includes(rec.id))
  }

  const { data: customerList }
  = useMspCustomerListQuery({ params: useParams(), payload: customerListPayload })

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
    setSelected(selectedRows ?? [])
    resetFields()
    setVisible(false)
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend'
    }
  ]

  useEffect(() => {
    if (customerList?.data) {
      const ecIds = selected?.map((ec: MspEc)=> ec.id)
      const selectKeys = getSelectedKeys(customerList?.data as MspEc[], ecIds)
      setSelectedKeys(selectKeys)
      const selRows = getSelectedRows(customerList?.data as MspEc[], ecIds)
      setSelectedRows(selRows)
    }
    // setIsLoaded(isSkip || (queryResults?.data && delegatedAdmins?.data) as unknown as boolean)
  }, [customerList?.data])

  const content =
  <Space direction='vertical'>
    <Loader >
      <Table
        columns={columns}
        dataSource={customerList?.data}
        rowKey='id'
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedKeys,
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
      width={420}
    >
      {content}
    </Drawer>
  )
}
