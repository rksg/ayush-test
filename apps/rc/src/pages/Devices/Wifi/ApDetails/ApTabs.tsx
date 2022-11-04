/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { ApDetailHeader }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function ApTabs (props:{ apDetail: ApDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/aps/${params.serialNumber}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const { apDetail } = props

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'AI Analytics' })} key='analytics' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })} key='troubleshooting' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Reports' })} key='reports' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount: apDetail?.headers?.networks })}
        key='networks'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount: apDetail?.headers?.clients })}
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount: apDetail?.headers?.services || 0 })} // TODO: API support
        key='services'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default ApTabs
