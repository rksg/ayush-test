import { useState } from 'react'

import { Radio } from 'antd'

import { LineChartOutline, ListSolid, PortSolid } from '@acx-ui/icons'
import { SwitchPortTable, SwitchTable }           from '@acx-ui/rc/components'

import { IconRadioGroup } from '../VenueMeshAps/styledComponents'

export function VenueSwitches () {
  const [ showIdx, setShowInx ] = useState(1)
  return (<>
    <IconRadioGroup value={showIdx}
      size='small'
      buttonStyle='solid'
      onChange={e => setShowInx(e.target.value)}>
      <Radio.Button value={0}><LineChartOutline /></Radio.Button>
      <Radio.Button value={1}><ListSolid /></Radio.Button>
      <Radio.Button value={2}><PortSolid /></Radio.Button>
    </IconRadioGroup>
    { showIdx === 0 && <div></div>}
    { showIdx === 1 && <SwitchTable />}
    { showIdx === 2 && <SwitchPortTable isVenueLevel={true} />}
  </>)
}