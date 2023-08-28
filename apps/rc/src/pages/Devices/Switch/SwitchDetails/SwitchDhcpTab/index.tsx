import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { showActionModal, Tabs, Tooltip } from '@acx-ui/components'
import {
  useGetSwitchQuery,
  useSwitchDetailHeaderQuery,
  useUpdateDhcpServerStateMutation
} from '@acx-ui/rc/services'
import {
  IP_ADDRESS_TYPE,
  isOperationalSwitch,
  VenueMessages
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchDhcpLeaseTable } from './SwitchDhcpLeaseTable'
import { SwitchDhcpPoolTable }  from './SwitchDhcpPoolTable'

export function SwitchDhcpTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeTab, activeSubTab, serialNumber, switchId, tenantId } = useParams()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}/details/${activeTab}`)

  const { data: switchData, isLoading } = useGetSwitchQuery({ params: { switchId, tenantId } })
  const { data: switchDetail, isLoading: isDetailLoading }
    = useSwitchDetailHeaderQuery({ params: { switchId, tenantId } })
  const [ updateDhcpServerState ] = useUpdateDhcpServerStateMutation()

  const isOperational = switchDetail?.deviceStatus ?
    isOperationalSwitch(switchDetail?.deviceStatus, switchDetail.syncedSwitchConfig) : false

  const tooltip = !isOperational
    // eslint-disable-next-line max-len
    ? $t({ defaultMessage: 'Switch must be operational before you can apply the DHCP Service state.' })
    : (!!switchDetail?.cliApplied ? $t(VenueMessages.CLI_APPLIED) : '')

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
          updateDhcpServerState({ params: { tenantId, switchId }, payload: { state: checked } })
        }
      })
      return
    } else {
      updateDhcpServerState({ params: { tenantId, switchId }, payload: { state: checked } })
    }
  }

  const operations =
    <Form.Item style={{ marginBottom: 0 }}
      label={$t({ defaultMessage: 'DHCP Service state' })}>
      <Tooltip title={tooltip}>
        <Switch onChange={onDhcpStatusChange}
          checked={switchData?.dhcpServerEnabled}
          loading={isLoading || isDetailLoading}
          disabled={!isOperational || !!switchDetail?.cliApplied} />
      </Tooltip>
    </Form.Item>

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='pool'
      onChange={onTabChange}
      tabBarExtraContent={operations}
      type='second'>
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
