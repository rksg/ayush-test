import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { TenantLink }         from '@acx-ui/react-router-dom'

import { SwitchLicense } from './SwitchLicense'
import { WifiLicense }   from './WifiLicense'

export function LicensesTab () {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title='MSP Licenses'
        extra={[
          <TenantLink to='/msplicenses/updateLicenses' key='updateLicenses'>
            <Button>{$t({ defaultMessage: 'Update Licenses' })}</Button>
          </TenantLink>,
          <TenantLink to='/msplicenses/generateReport' key='GenerateReport'>
            <Button>{$t({ defaultMessage: 'Generate Usage Report' })}</Button>
          </TenantLink>
        ]}
      />
      <Tabs>
        <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifiLicense'>
          <WifiLicense></WifiLicense>
        </Tabs.TabPane>
        <Tabs.TabPane tab={$t({ defaultMessage: 'Switch' })} key='switchLicense'>
          <SwitchLicense></SwitchLicense>
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}
