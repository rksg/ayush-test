import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { ClientDualTable }                       from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { IconRadioGroup } from '../VenueDevicesTab/VenueWifi/styledComponents'
import { Radio } from 'antd'
import { LineChartOutline, ListSolid } from '@acx-ui/icons'
import { useState } from 'react'

export function VenueClientsTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, venueId } = useParams()
  const basePath = useTenantLink(`/venues/${venueId}/venue-details/clients`)
  const [ showIdx, setShowInx ] = useState(0)

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
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi' })} key='wifi'>
        <IconRadioGroup value={showIdx}
          buttonStyle='solid'
          size='small'
          onChange={e => setShowInx(e.target.value)}>
          <Radio.Button value={0}><LineChartOutline /></Radio.Button>
          <Radio.Button value={1}><ListSolid /></Radio.Button>
        </IconRadioGroup>
        { showIdx === 0 && <div>{$t({ defaultMessage: 'Reports' })}</div> }
        { showIdx === 1 && <ClientDualTable /> }
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Switch' })}
        key='switch'
        disabled={!useIsSplitOn(Features.DEVICES)}>
        {$t({ defaultMessage: 'Switch' })}
      </Tabs.TabPane>
    </Tabs>
  )
}
