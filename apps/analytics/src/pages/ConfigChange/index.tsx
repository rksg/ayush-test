import { GridRow, GridCol } from '@acx-ui/components'

export function ConfigChange () {
  return <GridRow>
    <GridCol col={{ span: 24 }}>
      <div style={{ height: 170 }}>chart</div>
    </GridCol>
    <GridCol col={{ span: 8 }}>
      <div>kpi</div>
    </GridCol>
    <GridCol col={{ span: 16 }}>
      <div>table</div>
    </GridCol>
  </GridRow>
}
