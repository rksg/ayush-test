import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                         from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { LineChartOutline, ListSolid }           from '@acx-ui/icons'
import { ClientDualTable, SwitchClientsTable }   from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport }                        from '@acx-ui/reports/components'
import {
  ReportType
} from '@acx-ui/reports/components'

import { IconThirdTab } from '../VenueDevicesTab/VenueWifi/styledComponents'

export function VenueClientsTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/clients`)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='wifi'
      onChange={onTabChange}
      type='second'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wireless' })}
        key='wifi'>
        <IconThirdTab>
          <Tabs.TabPane key='list'
            tab={<Tooltip title={$t({ defaultMessage: 'Client List' })}>
              <ListSolid />
            </Tooltip>}>
            <ClientDualTable />
          </Tabs.TabPane>
          <Tabs.TabPane key='overview'
            tab={<Tooltip title={$t({ defaultMessage: 'Report View' })}>
              <LineChartOutline />
            </Tooltip>}>
            <EmbeddedReport
              reportName={ReportType.CLIENT}
              rlsClause={`"zoneName" in ('${venueId}')`}
            />
          </Tabs.TabPane>
        </IconThirdTab>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Wired' })}
        key='switch'
        disabled={!useIsSplitOn(Features.DEVICES)}>
        <SwitchClientsTable filterBySwitch={true}/>
      </Tabs.TabPane>
    </Tabs>
  )
}
