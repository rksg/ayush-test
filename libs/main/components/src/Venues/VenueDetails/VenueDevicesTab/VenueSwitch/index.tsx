import { useIntl } from 'react-intl'


import { Tabs, Tooltip }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { LineChartOutline, ListSolid, PortSolid } from '@acx-ui/icons'
import { SwitchPortTable, SwitchTable }           from '@acx-ui/rc/components'
import { useGetSwitchModelListQuery }             from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }  from '@acx-ui/react-router-dom'
import { EmbeddedReport,ReportType }              from '@acx-ui/reports/components'

import { IconThirdTab } from '../VenueWifi/styledComponents'

export function VenueSwitch () {
  const { $t } = useIntl()
  const params = useParams()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${params.venueId}/venue-details/devices`)

  const { getSwitchModelList } = useGetSwitchModelListQuery({
    params: { tenantId: params.tenantId },
    enableRbac: isSwitchRbacEnabled,
    payload: {
      fields: ['name', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: { venueId: [params.venueId] }
    }
  }, {
    selectFromResult: ({ data }) => ({
      getSwitchModelList: data?.data.map(v => ({ key: v.name, value: v.name })) || true
    })
  })

  const onCategoryTabChange = (tab: string) => {
    const { activeSubTab } = params
    activeSubTab && navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeSubTab}/${tab}`
    })
  }

  return (
    <IconThirdTab
      activeKey={params?.categoryTab}
      defaultActiveKey='list'
      onChange={onCategoryTabChange}
      destroyInactiveTabPane
    >
      <Tabs.TabPane key='list'
        tab={<Tooltip title={$t({ defaultMessage: 'Device List' })}>
          <ListSolid />
        </Tooltip>}>
        <SwitchTable settingsId='venue-switch-table'
          searchable={true}
          enableActions={true}
          filterableKeys={{ model: getSwitchModelList }} />
      </Tabs.TabPane>
      <Tabs.TabPane key='port'
        tab={<Tooltip title={$t({ defaultMessage: 'Port List' })}>
          <PortSolid />
        </Tooltip>}>
        <SwitchPortTable isVenueLevel={true} />
      </Tabs.TabPane>
      <Tabs.TabPane key='overview'
        tab={<Tooltip title={$t({ defaultMessage: 'Report View' })}>
          <LineChartOutline />
        </Tooltip>}>
        <EmbeddedReport
          reportName={ReportType.SWITCH}
          rlsClause={`"switchGroupLevelOneName" in ('${params?.venueId}')`}
        />
      </Tabs.TabPane>
    </IconThirdTab>
  )
}
