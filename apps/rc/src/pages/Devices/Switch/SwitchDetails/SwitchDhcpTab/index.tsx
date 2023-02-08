import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tabs } from '@acx-ui/components'
import {
  useGetDhcpLeasesQuery,
  useGetSwitchQuery,
  useSwitchDetailHeaderQuery,
  useUpdateDhcpServerStateMutation
} from '@acx-ui/rc/services'
import {
  IP_ADDRESS_TYPE,
  isOperationalSwitch,
  SwitchDhcpLease
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchDhcpPoolTable } from './SwitchDhcpPoolTable'


export function SwitchDhcpTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeTab, activeSubTab, serialNumber, switchId, tenantId } = useParams()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}/details/${activeTab}`)

  const { data: switchData, isLoading } = useGetSwitchQuery({ params: { switchId, tenantId } })
  const { data: switchDetail } = useSwitchDetailHeaderQuery({ params: { switchId, tenantId } })
  const [ updateDhcpServerState ] = useUpdateDhcpServerStateMutation()

  const isOperational = switchDetail?.deviceStatus ?
    isOperationalSwitch(switchDetail?.deviceStatus, switchDetail.syncedSwitchConfig) : false

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const onDhcpStatusChange = (checked: boolean) => {
    if (checked === true && switchData?.dhcpClientEnabled) {
      showActionModal({
        type: 'info',
        content: $t({ defaultMessage: `
          DHCP server cannot be enabled since this switch is currently acting as a DHCP client.
          Configure static IP address on the switch and try again.` })
      })
      return
    } else if (checked === true && switchData?.ipAddressType === IP_ADDRESS_TYPE.STATIC) {
      showActionModal({
        type: 'confirm',
        content: $t({ defaultMessage: `
          This switch can no longer act as a DHCP client once DHCP server is enabled.` }),
        onOk: () => {
          updateDhcpServerState({ params: { tenantId, switchId }, payload: { status: checked } })
        }
      })
      return
    } else {
      updateDhcpServerState({ params: { tenantId, switchId }, payload: { status: checked } })
    }
  }

  const operations =
    <Form.Item style={{ marginBottom: 0 }}
      label={$t({ defaultMessage: 'DHCP Service state' })}>
      <Switch onChange={onDhcpStatusChange}
        checked={switchData?.dhcpServerEnabled}
        loading={isLoading}
        disabled={!isOperational} />
    </Form.Item>

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='pool'
      onChange={onTabChange}
      tabBarExtraContent={operations}
      type='card'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Pools' })} key='pool'>
        <SwitchDhcpPoolTable />
      </Tabs.TabPane>
      {isOperational && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Leases' })}
        key='lease'>
        <SwitchDhcpLeaseTable />
      </Tabs.TabPane>}
    </Tabs>
  )
}



export function SwitchDhcpLeaseTable () {
  const { $t } = useIntl()
  const { switchId, tenantId } = useParams()

  const { data: leaseData, isLoading } = useGetDhcpLeasesQuery({ params: { switchId, tenantId } })

  const columns: TableProps<SwitchDhcpLease>['columns'] = [
    {
      key: 'clientId',
      title: $t({ defaultMessage: 'Client ID' }),
      dataIndex: 'clientId',
      sorter: false
    }, {
      key: 'clientIp',
      title: $t({ defaultMessage: 'Client IP' }),
      dataIndex: 'clientIp',
      sorter: false
    }, {
      key: 'leaseExpiration',
      title: $t({ defaultMessage: 'Lease Expiration' }),
      dataIndex: 'leaseExpiration',
      sorter: false
    }, {
      key: 'leaseType',
      title: $t({ defaultMessage: 'Lease Type' }),
      dataIndex: 'leaseType',
      sorter: false
    }
  ]

  return (
    <Loader states={[{ isLoading }]}>
      <Table
        columns={columns}
        dataSource={leaseData}
        rowKey='clientId' />
    </Loader>
  )
}