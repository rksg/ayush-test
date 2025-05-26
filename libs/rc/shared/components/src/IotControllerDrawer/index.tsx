import { useState } from 'react'

import {
  Space } from 'antd'
import { Key as AntdTableKeyType } from 'antd/lib/table/interface'
import { useIntl }                 from 'react-intl'

import { Button,
  Drawer,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetIotControllerListQuery
}                            from '@acx-ui/rc/services'
import {
  IotControllerStatus,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
// import { getOpsApi }                     from '@acx-ui/utils'

interface IotControllerDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const IotControllerDrawer = (props: IotControllerDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const payload = {
    filters: {}
  }
  const settingsId = 'iot-controller-table'
  const tableQuery = useTableQuery({
    useQuery: useGetIotControllerListQuery,
    defaultPayload: payload,
    pagination: { settingsId },
    search: {
      searchTargetFields: ['name']
    }
  })

  const onClose = () => {
    setVisible(false)
  }

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // eslint-disable-next-line max-len
  const handleRowSelectChange = (selectedRowKeys: AntdTableKeyType[]) => {
    setSelectedRowKeys(selectedRowKeys)
  }


  const columns: TableProps<IotControllerStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: false,
      searchable: true,
      render: function (_, row, __, highlightFn) {
        return (
          <TenantLink
            to={`/iots/${row.id}/details/overview`}>
            {highlightFn(row.name)}</TenantLink>
        )
      }
    },{
      title: $t({ defaultMessage: 'FQDN / IP (AP)' }),
      dataIndex: 'inboundAddress',
      key: 'inboundAddress'
    },
    {
      title: $t({ defaultMessage: 'FQDN / IP (R1)' }),
      dataIndex: 'publicAddress',
      key: 'publicAddress'
    },
    {
      title: $t({ defaultMessage: 'Associated <VenuePlural></VenuePlural> Count' }),
      dataIndex: 'venueCount',
      key: 'venueCount'
    }
  ]

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='primary'
        onClick={onClose}>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Associate IoT Controller' })}
      visible={visible}
      onClose={onClose}
      width={644}
      footer={footer}
      children={
        <Loader>
          <Table
            columns={columns}
            // type='compact'
            dataSource={tableQuery?.data?.data}
            rowKey='name'
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add IoT Controller' })
            }])}
            rowSelection={{
              type: 'radio',
              onChange: handleRowSelectChange,
              selectedRowKeys
            }}
          />
        </Loader>
      }
    />
  )
}
