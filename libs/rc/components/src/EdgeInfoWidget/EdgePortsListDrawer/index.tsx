import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Drawer
} from '@acx-ui/components'
import { EdgePort }                   from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { formatter }                  from '@acx-ui/utils'


const EdgePortsTable = ({ data }: { data: EdgePort[] }) => {
  const { $t } = useIntl()

  const columns: TableProps<EdgePort>['columns'] = [
    {
      title: $t({ defaultMessage: '#' }),
      key: 'portId',
      dataIndex: 'portId',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Connected Device' }),
      key: 'mac',
      dataIndex: 'mac',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speed',
      dataIndex: 'speed',
      sorter: true,
      render: (data, row) => {
        return formatter('networkSpeedFormat')(row.speed)
      }
    },
    {
      title: $t({ defaultMessage: 'Duplex Speed' }),
      key: 'duplexSpeed',
      dataIndex: 'duplexSpeed',
      sorter: true,
      render: (data, row) => {
        return formatter('networkSpeedFormat')(row.duplexSpeed)
      }
    }
  ]

  return (
    <Table
      columns={columns}
      dataSource={data}
    />
  )
}

const EdgePortsListDrawer = ({ visible, setVisible, edgePortsSetting }:
   { visible: boolean, setVisible: (visible: boolean) => void,
    edgePortsSetting: EdgePort[] }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const onClose = () => {
    setVisible(false)
  }
  const handlePortSettingClick = () => {
    // TODO: confirm the URL of port configuration page.
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edge-details/edit/ports`
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
        <EdgePortsTable data={edgePortsSetting as EdgePort[]}/>
      </>}
    width={'auto'}
    style={{ alignItems: 'right' }}
  />
  )
}

export default EdgePortsListDrawer