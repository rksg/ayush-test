import { Form, Select, Space } from 'antd'
import { useIntl }             from 'react-intl'

import { Button, Drawer, Loader, Table, TableProps } from '@acx-ui/components'
import { DhcpPoolStats }                             from '@acx-ui/rc/utils'

import { useMockData } from './Pools'

interface ManageDhcpDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const ManageDhcpDrawer = (props: ManageDhcpDrawerProps) => {

  const { visible, setVisible } = props
  const { $t } = useIntl()
  const { data, isLoading } = useMockData()

  const columns: TableProps<DhcpPoolStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'range',
      dataIndex: 'range'
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'gateway',
      dataIndex: 'gateway'
    }
  ]

  const drawerContent = <>
    <Form
      layout='vertical'
    >
      <Form.Item label={$t({ defaultMessage: 'DHCP Service' })}>
        <Space>
          <Form.Item noStyle>
            <Select style={{ width: '200px' }} options={[]} />
          </Form.Item>
          <Button type='link' children={$t({ defaultMessage: 'Add' })} />
        </Space>
      </Form.Item>
    </Form>
    <Loader states={[
      { isFetching: isLoading, isLoading: false }
    ]}>
      <Table
        type='form'
        columns={columns}
        dataSource={data}
      />
    </Loader>
  </>

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Manage DHCP for SmartEdge Service' })}
      width='500'
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
    />
  )
}

export default ManageDhcpDrawer