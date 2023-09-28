import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { RWG }                                   from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function RWGTabs (props:{ gatewayDetail: RWG }) {
  const { $t } = useIntl()
  const params = useParams()
  const { gatewayDetail } = props
  const basePath = useTenantLink(`/ruckus-wan-gateway/${gatewayDetail?.id}/gateway-details`)
  const navigate = useNavigate()

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const dnsRecordsCount = 0 // TODO

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'DNS Records ({dnsRecordsCount})' }, { dnsRecordsCount })}
        key='dnsRecords'
      />
    </Tabs>
  )
}

export default RWGTabs
