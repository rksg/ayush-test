import { useIntl } from 'react-intl'

import {
  Button, Drawer, Table,
  TableProps
} from '@acx-ui/components'
import { formatter }                             from '@acx-ui/formatter'
import { EdgePortStatus }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'


const EdgePortsTable = ({ data }: { data: EdgePortStatus[] }) => {
  const { $t } = useIntl()

  const columns: TableProps<EdgePortStatus>['columns'] = [
    {
      title: $t({ defaultMessage: '#' }),
      key: 'sortIdx',
      dataIndex: 'sortIdx',
      defaultSortOrder: 'ascend',
      render: (id, record, index) => {
        return index + 1
      }
    },
    {
      title: $t({ defaultMessage: 'Port' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status'
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type'
    },
    {
      title: $t({ defaultMessage: 'Connected Device' }),
      key: 'mac',
      dataIndex: 'mac'
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speedKbps',
      dataIndex: 'speedKbps',
      render: (data, row) => {
        return formatter('networkSpeedFormat')(row.speedKbps)
      }
    },
    {
      title: $t({ defaultMessage: 'Duplex Speed' }),
      key: 'duplex',
      dataIndex: 'duplex'
    }
  ]

  return (
    <Table
      rowKey='portId'
      columns={columns}
      dataSource={data}
    />
  )
}

const EdgePortsListDrawer = ({ visible, setVisible, edgePortsSetting }:
   { visible: boolean, setVisible: (visible: boolean) => void,
    edgePortsSetting: EdgePortStatus[] }) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/edge')
  const onClose = () => {
    setVisible(false)
  }

  const handlePortSettingClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${params.serialNumber}/edit/ports`
    })
  }

  return (<Drawer
    title={$t({ defaultMessage: 'Port Details' })}
    visible={visible}
    onClose={onClose}
    children={
      <>
        <Button
          key='configure'
          size='small'
          type='link'
          onClick={handlePortSettingClick}

        >{$t({ defaultMessage: 'Configure Port Settings' })}</Button>
        <EdgePortsTable data={edgePortsSetting as EdgePortStatus[]}/>
      </>}
    width={'auto'}
    bodyStyle={{ alignItems: 'flex-end' }}
  />
  )
}

export default EdgePortsListDrawer