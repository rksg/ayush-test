import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import LldpTlvTable           from './LldpTlvTable'
import MacOuiTable            from './MacOuiTable'
import SwitchPortProfileTable from './SwitchPortProfileTable'

const SwitchProfileTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink('/policies/portProfile/switch')
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeSubTab} type='card'>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Profiles' })} key='profiles' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'MAC OUI' })} key='macs' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'LLDP TLV' })} key='lldps' />
    </Tabs>
  )
}

const tabs = {
  profiles: SwitchPortProfileTable,
  macs: MacOuiTable,
  lldps: LldpTlvTable
}

const SwitchPortProfile = () => {
  const { $t } = useIntl()
  const { activeSubTab } = useParams()
  const Tab = tabs[activeSubTab as keyof typeof tabs]
  return (
    <>
      <SwitchProfileTabs />
      { Tab && <Tab /> }
    </>
  )
}

export default SwitchPortProfile