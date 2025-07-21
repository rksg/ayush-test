// import { useIntl } from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'

import { OltFrontRearView } from './OltFrontRearView'
// import {} from '../styledComponents'

export const OltOverviewTab = () => {
  // const { $t } = useIntl()

  return (<>
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <OltFrontRearView />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '380px' }}>

      </GridCol>
    </GridRow>
  </>)
}

// const OltStatisticNoDataWidget = (props: { title: string }) => {
//   return <HistoricalCard title={props.title}>
//     <NoData />
//   </HistoricalCard>
// }