import {
  GridRow,
  GridCol
} from '@acx-ui/components'

import { ActivePluginsWidget } from './ActivePluginsWidget'
import { IotApsWidget }        from './IotApsWidget'

export function IotControllerOverviewTab () {

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 6 }} style={{ height: '200px' }}>
            <IotApsWidget />
          </GridCol>
          <GridCol col={{ span: 6 }} style={{ height: '200px' }}>
            <IotApsWidget />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <IotApsWidget />
          </GridCol>
        </GridRow>
        <GridRow style={{ marginTop: '10px' }}>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <IotApsWidget />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <ActivePluginsWidget />
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>
  )
}
