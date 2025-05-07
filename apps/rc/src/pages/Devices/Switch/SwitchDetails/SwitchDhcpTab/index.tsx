import { useContext } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import { showActionModal, Tabs, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import {
  useGetSwitchQuery,
  useUpdateDhcpServerStateMutation
} from '@acx-ui/rc/services'
import {
  IP_ADDRESS_TYPE,
  SwitchRbacUrlsInfo,
  VenueMessages
} from '@acx-ui/rc/utils'
import { isOperationalSwitch }         from '@acx-ui/rc/switch/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                          from '@acx-ui/types'
import { hasPermission }                         from '@acx-ui/user'
import { getOpsApi }                             from '@acx-ui/utils'

import { SwitchDetailsContext } from '..'

import { SwitchDhcpLeaseTable } from './SwitchDhcpLeaseTable'
import { SwitchDhcpPoolTable }  from './SwitchDhcpPoolTable'

export function SwitchDhcpTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeTab, activeSubTab, serialNumber, switchId, tenantId } = useParams()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}/details/${activeTab}`)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader: switchDetail } = switchDetailsContextData

  const { data: switchData, isLoading } = useGetSwitchQuery({
    params: { switchId, tenantId, venueId: switchDetail?.venueId },
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !switchDetail?.venueId
  })
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
          updateDhcpServerState({
            params: { tenantId, switchId, venueId: switchDetail?.venueId },
            payload: { state: checked },
            enableRbac: isSwitchRbacEnabled,
            option: {
              skip: !switchDetail?.venueId
            }
          })
        }
      })
      return
    } else {
      updateDhcpServerState({
        params: { tenantId, switchId, venueId: switchDetail?.venueId },
        payload: { state: checked },
        enableRbac: isSwitchRbacEnabled,
        option: {
          skip: !switchDetail?.venueId
        }
      })
    }
  }

  const operations =
    <Form.Item style={{ marginBottom: 0 }}
      label={$t({ defaultMessage: 'DHCP Service state' })}>
      <Tooltip title={tooltip}>
        <Switch onChange={onDhcpStatusChange}
          checked={switchData?.dhcpServerEnabled}
          loading={isLoading}
          disabled={!isOperational || !!switchDetail?.cliApplied} />
      </Tooltip>
    </Form.Item>

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='pool'
      onChange={onTabChange}
      tabBarExtraContent={hasPermission({
        scopes: [SwitchScopes.UPDATE],
        rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateDhcpServerState)]
      }) && operations}
      type='card'
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Pools' })} key='pool'>
        <SwitchDhcpPoolTable />
      </Tabs.TabPane>
      {isOperational && <Tabs.TabPane
        tab={$t({ defaultMessage: 'Leases' })}
        key='lease'>
        <SwitchDhcpLeaseTable
          venueId={switchDetail?.venueId}
        />
      </Tabs.TabPane>}
    </Tabs>
  )
}
