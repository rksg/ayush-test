import { useIntl } from 'react-intl'

import { GridRow, HistoricalCard, NoData }                                from '@acx-ui/components'
import { EdgeOltResourceUtilizationWidget, EdgeOltTrafficByVolumeWidget } from '@acx-ui/edge/components'
import { EdgeNokiaCageData }                                              from '@acx-ui/rc/utils'

import { WidgetContainer } from './styledComponents'

export const PerformanceTab = (props: {
  isOltOnline: boolean,
  cagesList: EdgeNokiaCageData[] | undefined,
  isLoading: boolean,
  isFetching: boolean
 }) => {
  const { $t } = useIntl()
  const { cagesList, isOltOnline, isLoading } = props

  return (
    <GridRow>
      <WidgetContainer col={{ span: 12 }}>
        {isOltOnline
          ? <EdgeOltTrafficByVolumeWidget
            cages={cagesList}
            isLoading={isLoading}
          />
          : <OltStatisticNoDataWidget title={$t({ defaultMessage: 'Traffic by Volume' })} />}
      </WidgetContainer>
      <WidgetContainer col={{ span: 12 }}>
        {isOltOnline
          ? <EdgeOltResourceUtilizationWidget isLoading={isLoading} />
          : <OltStatisticNoDataWidget title={$t({ defaultMessage: 'Resource Utilization' })} />}
      </WidgetContainer>
    </GridRow>
  )
}

const OltStatisticNoDataWidget = (props: { title: string }) => {
  return <HistoricalCard title={props.title}>
    <NoData />
  </HistoricalCard>
}