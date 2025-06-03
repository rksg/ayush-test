import {
  GridRow,
  GridCol
} from '@acx-ui/components'

import { ActivePluginsByRadio }   from './ActivePluginsByRadio'
import { ActivePluginsWidget }    from './ActivePluginsWidget'
import { AssociatedVenues }       from './AssociatedVenues'
import { RcapLicenseUtilization } from './RcapLicenseUtilization'
// import { IotApsWidget }           from './IotApsWidget'

export function IotControllerOverviewTab () {

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '410px' }}>
        <GridRow>
          <GridCol col={{ span: 6 }} style={{ height: '200px' }}>
            <RcapLicenseUtilization />
          </GridCol>
          <GridCol col={{ span: 6 }} style={{ height: '200px' }}>
            <RcapLicenseUtilization />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <AssociatedVenues />
          </GridCol>
        </GridRow>
        <GridRow style={{ marginTop: '10px' }}>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <ActivePluginsByRadio />
          </GridCol>
          <GridCol col={{ span: 12 }} style={{ height: '200px' }}>
            <ActivePluginsWidget />
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>
  )
}
