import { useState } from 'react'

import { Radio }     from 'antd'
import { useParams } from 'react-router-dom'

import { LineChartOutline, ListSolid, PortSolid } from '@acx-ui/icons'
import { SwitchPortTable, SwitchTable }           from '@acx-ui/rc/components'
import { useGetSwitchModelListQuery }             from '@acx-ui/rc/services'
import { EmbeddedReport }                         from '@acx-ui/reports/components'
import {
  ReportType,
  reportTypeDataStudioMapping
} from '@acx-ui/reports/components'

import { IconRadioGroup } from '../VenueWifi/styledComponents'

export function VenueSwitch () {
  const params = useParams()
  const [ showIdx, setShowIdx ] = useState(1)

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

  return (<>
    <IconRadioGroup value={showIdx}
      size='small'
      buttonStyle='solid'
      onChange={e => setShowIdx(e.target.value)}>
      <Radio.Button value={0}><LineChartOutline /></Radio.Button>
      <Radio.Button value={1}><ListSolid /></Radio.Button>
      <Radio.Button value={2}><PortSolid /></Radio.Button>
    </IconRadioGroup>
    { showIdx === 0 &&
      <div style={{ paddingTop: 20 }}>
        <EmbeddedReport
          embedDashboardName={reportTypeDataStudioMapping[ReportType.SWITCH]}
          rlsClause={`"switchGroupLevelOneName" in ('${params?.venueId}')`}
        />
      </div>
    }
    {showIdx === 1 && <SwitchTable searchable={true}
      enableActions={true}
      filterableKeys={{ model: getSwitchModelList }} />}
    { showIdx === 2 && <SwitchPortTable isVenueLevel={true} />}
  </>)
}
