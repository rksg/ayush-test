import { useState } from 'react'

import { Radio }   from 'antd'
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { LineChartOutline, ListSolid }           from '@acx-ui/icons'
import { ClientDualTable, SwitchClientsTable }   from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { EmbeddedReport }                        from '@acx-ui/reports/components'
import {
  ReportType
} from '@acx-ui/reports/components'

import { IconRadioGroup } from '../VenueDevicesTab/VenueWifi/styledComponents'

export function VenueClientsTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/clients`)
  const [ showIdx, setShowIdx ] = useState(0)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
        <IconRadioGroup value={showIdx}
          buttonStyle='solid'
          size='small'
          onChange={e => setShowIdx(e.target.value)}>
          <Radio.Button value={0}><LineChartOutline /></Radio.Button>
          <Radio.Button value={1}><ListSolid /></Radio.Button>
        </IconRadioGroup>
        { showIdx === 0 && (
          <div style={{ paddingTop: 15 }}>
            <EmbeddedReport
              reportName={ReportType.CLIENT}
              rlsClause={`"zoneName" in ('${venueId}')`}
            />
          </div>) }
        { showIdx === 1 && <div style={{ paddingTop: 15 }}><ClientDualTable /></div> }
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
    </Tabs>
  )
}
