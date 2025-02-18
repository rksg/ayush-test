import { GridRow }                                                        from '@acx-ui/components'
import { EdgeOltResourceUtilizationWidget, EdgeOltTrafficByVolumeWidget } from '@acx-ui/edge/components'

import { WidgetContainer } from './styledComponents'

export const PerformanceTab = () => {
  return (
    <GridRow>
      <WidgetContainer col={{ span: 12 }}>
        <EdgeOltTrafficByVolumeWidget />
      </WidgetContainer>
      <WidgetContainer col={{ span: 12 }}>
        <EdgeOltResourceUtilizationWidget />
      </WidgetContainer>
      {/*
      <WidgetContainer col={{ span: 12 }}>
        <OltStatisticNoDataWidget title={$t({ defaultMessage: 'Traffic by Volume' })} />
      </WidgetContainer>
      <WidgetContainer col={{ span: 12 }}>
        <OltStatisticNoDataWidget title={$t({ defaultMessage: 'Resource Utilization' })} />
      </WidgetContainer>
      <WidgetContainer col={{ span: 8 }}>
        <OltStatisticNoDataWidget title={$t({ defaultMessage: 'Top 10 Ports by Errors' })} />
      </WidgetContainer>
      <WidgetContainer col={{ span: 16 }}>
        <OltStatisticNoDataWidget title={$t({ defaultMessage: 'Top 10 Ports by Errors' })} />
      </WidgetContainer>
      */}
    </GridRow>
  )
}

// const OltStatisticNoDataWidget = (props: { title: string }) => {
//   return <HistoricalCard title={props.title}>
//     <NoData />
//   </HistoricalCard>
// }