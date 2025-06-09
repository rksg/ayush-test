import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                                         from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }              from '@acx-ui/feature-toggle'
import { LineChartOutline, ListSolid }                           from '@acx-ui/icons'
import { ClientDualTable, SwitchClientsTable, BasePersonaTable } from '@acx-ui/rc/components'
import {
  useGetPersonaGroupByIdQuery,
  useGetQueriablePropertyConfigsQuery
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport, ReportType }            from '@acx-ui/reports/components'
import { ApWiredClientTable }                    from '@acx-ui/wifi/components'

import { IconThirdTab } from '../VenueDevicesTab/VenueWifi/styledComponents'

const venueOptionsDefaultPayload = {
  sortField: 'venueName',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 1
}

export function VenueClientsTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { venueId, activeSubTab, categoryTab } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/clients`)
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isSupportWifiWiredClient = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const { propertyConfig } = useGetQueriablePropertyConfigsQuery(
    { payload: { ...venueOptionsDefaultPayload, filters: { venueId } } },
    {
      skip: !isCloudpathBetaEnabled,
      selectFromResult: ({ data }) => {
        return {
          propertyConfig: data?.data[0]
        }
      }
    })
  const { data: personaGroupData } = useGetPersonaGroupByIdQuery(
    { params: { groupId: propertyConfig?.personaGroupId } },
    { skip: !propertyConfig?.personaGroupId || !isCloudpathBetaEnabled }
  )

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const onCategoryTabChange = (tab: string) => {
    activeSubTab && navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeSubTab}/${tab}`
    })
  }

  const tabs = [
    {
      label: $t({ defaultMessage: 'Wireless' }),
      value: 'wifi',
      children: <IconThirdTab
        activeKey={categoryTab}
        defaultActiveKey='list'
        onChange={onCategoryTabChange}
      >
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
    },
    ...(isSupportWifiWiredClient? [{
      label: $t({ defaultMessage: 'AP Wired' }),
      value: 'apWired',
      children: <ApWiredClientTable searchable={true} />

    }] : []),
    {
      label: $t({ defaultMessage: 'Switch Wired' }),
      value: 'switch',
      children: <SwitchClientsTable filterBySwitch={true}/>
    },

    ...(isCloudpathBetaEnabled
    && personaGroupData?.personalIdentityNetworkId
    && personaGroupData?.id ? [{
        label: $t(
          { defaultMessage: 'Identity ({count})' },
          { count: personaGroupData?.identities?.length ?? personaGroupData?.identityCount?? 0 }
        ),
        value: 'identity',
        children: <BasePersonaTable
          personaGroupId={personaGroupData?.id}
          colProps={{
            name: { searchable: true },
            groupId: { show: false, filterable: false },
            vlan: { show: false },
            ethernetPorts: { show: false }
          }}
        />
      }] : [])
  ]

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey={activeSubTab || tabs[0]?.value}
      onChange={onTabChange}
      type='card'
      destroyInactiveTabPane
    >
      {tabs.map((tab) => (
        <Tabs.TabPane
          tab={tab.label}
          key={tab.value}
        >
          {tab.children}
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}
