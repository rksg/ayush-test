import { Card, GridRow,  GridCol } from '@acx-ui/components'
import { OltOnt }                  from '@acx-ui/olt/utils'

interface OntInfoWidgetProps {
  ontDetails: OltOnt
  isLoading: boolean,
  isFetching: boolean
}

//eslint-disable-next-line @typescript-eslint/no-unused-vars
export const OntInfoWidget = (props: OntInfoWidgetProps) => {
  return <GridRow style={{ marginBottom: '12px' }}>
    <GridCol col={{ span: 24 }} style={{ height: '140px' }}>
      <Card type='solid-bg'>
        <GridRow style={{ flexGrow: '1', justifyContent: 'center' }}>
          OntInfoWidget
        </GridRow>
      </Card>
    </GridCol>
  </GridRow>
}