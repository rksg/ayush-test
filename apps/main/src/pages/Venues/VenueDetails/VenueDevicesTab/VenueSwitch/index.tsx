import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Tabs, Tooltip }                          from '@acx-ui/components'
import { LineChartOutline, ListSolid, PortSolid } from '@acx-ui/icons'
import { SwitchPortTable, SwitchTable }           from '@acx-ui/rc/components'
import { useGetSwitchModelListQuery }             from '@acx-ui/rc/services'
import { EmbeddedReport }                         from '@acx-ui/reports/components'
import {
  ReportType
} from '@acx-ui/reports/components'

import { IconThirdTab } from '../VenueWifi/styledComponents'

export function VenueSwitch () {
  const { $t } = useIntl()
  const params = useParams()

  const { getSwitchModelList } = useGetSwitchModelListQuery({
    params: { tenantId: params.tenantId }, payload: {
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

  return (
    <IconThirdTab>
      <Tabs.TabPane key='list'
        tab={<Tooltip title={$t({ defaultMessage: 'Device List' })}>
          <ListSolid />
        </Tooltip>}>
        <SwitchTable searchable={true}
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
