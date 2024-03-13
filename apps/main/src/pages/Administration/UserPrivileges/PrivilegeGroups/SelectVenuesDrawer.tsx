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
import { useVenuesListQuery } from '@acx-ui/rc/services'
import { Venue }              from '@acx-ui/rc/utils'

interface SelectVenuesDrawerProps {
  visible: boolean
  selected: Venue[]
  tenantIds?: string[]
  setVisible: (visible: boolean) => void
  setSelected: (selected: Venue[]) => void
}

const venuesListPayload = {
  fields: ['name', 'country', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const SelectVenuesDrawer = (props: SelectVenuesDrawerProps) => {
  const { $t } = useIntl()

  const { visible, selected, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<Venue[]>([])

  function getSelectedKeys (venues: Venue[], venueId: string[]) {
    return venues.filter(rec => venueId.includes(rec.id)).map(rec => rec.id)
  }

  function getSelectedRows (venues: Venue[], venueId: string[]) {
    return venues.filter(rec => venueId.includes(rec.id))
  }

  const { data: venuesList }
  = useVenuesListQuery({ params: useParams(), payload: venuesListPayload })

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
    setSelected(selectedRows)
    resetFields()
    setVisible(false)
  }

  const columns: TableProps<Venue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend'
    }
  ]

  useEffect(() => {
    if (venuesList?.data) {
      const venueIds = selected?.map((venue: Venue)=> venue.id)
      const selectKeys = getSelectedKeys(venuesList?.data as Venue[], venueIds)
      setSelectedKeys(selectKeys)
      const selRows = getSelectedRows(venuesList?.data as Venue[], venueIds)
      setSelectedRows(selRows)
    }
    // setIsLoaded(isSkip || (queryResults?.data && delegatedAdmins?.data) as unknown as boolean)
  }, [venuesList?.data])

  const content =
  <Space direction='vertical'>
    <Loader >
      <Table
        columns={columns}
        dataSource={venuesList?.data}
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

  const footer = <div>
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
      title={$t({ defaultMessage: 'Select Venues' })}
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

