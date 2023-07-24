import { useEffect, useState } from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BasePersonaTable } from 'apps/rc/src/pages/Users/Persona/PersonaTable/BasePersonaTable'
import { useIntl }          from 'react-intl'

import { Tabs, Tooltip }                                                        from '@acx-ui/components'
import { useIsSplitOn, Features, useIsTierAllowed }                             from '@acx-ui/feature-toggle'
import { LineChartOutline, ListSolid }                                          from '@acx-ui/icons'
import { ClientDualTable, SwitchClientsTable }                                  from '@acx-ui/rc/components'
import { useGetQueriablePropertyConfigsQuery, useLazyGetPersonaGroupByIdQuery } from '@acx-ui/rc/services'
import { PersonaGroup }                                                         from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                from '@acx-ui/react-router-dom'
import { EmbeddedReport }                                                       from '@acx-ui/reports/components'
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
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const [hasNSG, setHasNSG] = useState(false) // determine this Venue has bound with network segmentation or not
  const [personaGroupData, setPersonaGroupData] = useState<PersonaGroup|undefined>(undefined)
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const propertyConfigsQuery = useGetQueriablePropertyConfigsQuery({
    payload: { ...venueOptionsDefaultPayload, filters: { venueId } }
  }, { skip: !isCloudpathBetaEnabled })

  useEffect(() => {
    if (propertyConfigsQuery.isLoading && !propertyConfigsQuery.data) return
    const personaGroupId = propertyConfigsQuery.data?.data[0]?.personaGroupId

    if (!personaGroupId) return

    getPersonaGroupById({ params: { groupId: personaGroupId } })
      .then(result => {
        setPersonaGroupData(result.data)
        setHasNSG(!!result.data?.nsgId)
      })
  }, [propertyConfigsQuery])

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
      type='card'>
      <Tabs.TabPane
        tab={isNavbarEnhanced
          ? $t({ defaultMessage: 'Wireless' })
          : $t({ defaultMessage: 'Wi-Fi' })
        }
        key='wifi'>
        <IconThirdTab>
          <Tabs.TabPane key='overview'
            tab={<Tooltip title={$t({ defaultMessage: 'Report View' })}>
              <LineChartOutline />
            </Tooltip>}>
            <EmbeddedReport
              reportName={ReportType.CLIENT}
              rlsClause={`"zoneName" in ('${venueId}')`}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key='list'
            tab={<Tooltip title={$t({ defaultMessage: 'Client List' })}>
              <ListSolid />
            </Tooltip>}>
            <ClientDualTable />
          </Tabs.TabPane>
        </IconThirdTab>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={isNavbarEnhanced
          ? $t({ defaultMessage: 'Wired' })
          : $t({ defaultMessage: 'Switch' })
        }
        key='switch'
        disabled={!useIsSplitOn(Features.DEVICES)}>
        <SwitchClientsTable filterBySwitch={true}/>
      </Tabs.TabPane>
      {isCloudpathBetaEnabled && hasNSG && personaGroupData?.id &&
        <Tabs.TabPane
          tab={$t(
            { defaultMessage: 'Persona ({count})' },
            { count: personaGroupData?.personas?.length ?? 0 }
          )}
          key={'persona'}
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
