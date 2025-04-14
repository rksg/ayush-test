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
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useMspCustomerListQuery } from '@acx-ui/msp/services'
import { MspEc, MspEcWithVenue }   from '@acx-ui/msp/utils'
import { AccountType }             from '@acx-ui/utils'

interface SelectCustomerOnlyDrawerProps {
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

export const SelectCustomerOnlyDrawer = (props: SelectCustomerOnlyDrawerProps) => {
  const { $t } = useIntl()

  const { visible, selected, setVisible, setSelected } = props
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspEc[]>([])
  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  function getSelectedKeys (ecs: MspEc[], ecId: string[]) {
    return ecs.filter(rec => ecId.includes(rec.id)).map(rec => rec.id)
  }

  function getSelectedRows (ecs: MspEc[], ecId: string[]) {
    return ecs.filter(rec => ecId.includes(rec.id))
  }

  const { data: customerList } =
      useMspCustomerListQuery({ params: useParams(), payload: customerListPayload,
        enableRbac: isViewmodleAPIsMigrateEnabled })

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
    const ecsWithSelVenues: MspEcWithVenue[] =
      selectedRows.map(ec => {
        return {
          ...ec,
          allVenues: true
        } as MspEcWithVenue
      })
    setSelected(ecsWithSelVenues)
    resetFields()
    setVisible(false)
  }

  const columns: TableProps<MspEc>['columns'] = [
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
      const venueIds = selected?.map((ec: MspEc)=> ec.id)
      const selectKeys = getSelectedKeys(customerList?.data as MspEc[], venueIds)
      setSelectedKeys(selectKeys)
      const selRows = getSelectedRows(customerList?.data as MspEc[], venueIds)
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

