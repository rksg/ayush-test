
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BasePersonaTable } from 'apps/rc/src/pages/Users/Persona/PersonaTable/BasePersonaTable'
import { useIntl }          from 'react-intl'

import { Tabs, Tooltip }                            from '@acx-ui/components'
import { useIsSplitOn, Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { LineChartOutline, ListSolid }              from '@acx-ui/icons'
import { ClientDualTable, SwitchClientsTable }      from '@acx-ui/rc/components'
import {
  useGetPersonaGroupByIdQuery,
  useGetQueriablePropertyConfigsQuery
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport }                        from '@acx-ui/reports/components'
import {
  ReportType
} from '@acx-ui/reports/components'

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
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/clients`)
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
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

  return (
    <Tabs activeKey={activeSubTab}
      defaultActiveKey='wifi'
      onChange={onTabChange}
      type='card'
    >
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
      {(isCloudpathBetaEnabled && personaGroupData?.nsgId && personaGroupData?.id) &&
        <Tabs.TabPane
          tab={$t(
            { defaultMessage: 'Identity ({count})' },
            { count: personaGroupData?.personas?.length ?? 0 }
          )}
          key={'identity'}
        >
          <BasePersonaTable
            personaGroupId={personaGroupData.id}
            colProps={{
              name: { searchable: true },
              groupId: { show: false, filterable: false },
              vlan: { show: false },
              ethernetPorts: { show: false }
            }}
          />
        </Tabs.TabPane>
      }
    </Tabs>
  )
}
