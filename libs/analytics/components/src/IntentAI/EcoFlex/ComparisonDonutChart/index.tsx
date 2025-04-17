
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import {
  Card,
  DonutChart,
  Loader
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { useIntentContext }  from '../../IntentContext'
import { dataRetentionText } from '../../utils'

import { Legend }                           from './Legend'
import { KpiData, useIntentAIEcoFlexQuery } from './services'
import * as UI                              from './styledComponents'

function DataGraph ({ kpiData, isDetail }: { kpiData: KpiData, isDetail: boolean }) {
  const tooltipFormat = defineMessage({
    defaultMessage: ` <b>{formattedValue} {value, plural,
      one {AP}
      other {APs}
      } ({formattedPercent})</b> {value, plural,
      one {is}
      other {are}
    } {name}`
  })

  return <>
    <UI.DonutChartWrapper isDetail={isDetail}>
      <AutoSizer>{({ height, width }) =>
        <DonutChart
          showLegend={false}
          style={{ width , height }}
          showTotal={false}
          tooltipFormat={tooltipFormat}
          dataFormatter={formatter('countFormat')}
          data={kpiData.compareData.data}
        />}</AutoSizer>
    </UI.DonutChartWrapper>
    <UI.ArrowWrapper isDetail={isDetail} children={<UI.RightArrow/>} />
    <UI.DonutChartWrapper isDetail={isDetail}>
      <AutoSizer>{({ height, width }) =>
        <DonutChart
          showLegend={false}
          style={{ width, height }}
          showTotal={false}
          tooltipFormat={tooltipFormat}
          dataFormatter={formatter('countFormat')}
          data={kpiData.data.data}
        />}</AutoSizer>
    </UI.DonutChartWrapper>
    <Legend />
  </>
}

const GraphTitle = ({ kpiData }: { kpiData: KpiData }) => {
  const { $t } = useIntl()
  return <UI.GraphTitleWrapper>
    <div>
      <UI.GraphTitle>{$t({ defaultMessage: 'Before' })}</UI.GraphTitle>
      <UI.GraphSubTitle>
        {$t({ defaultMessage: 'As of {dateTime}' }, {
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(kpiData.compareData.timestamp)
        })}
      </UI.GraphSubTitle>
    </div>
    <div style={{ width: '24px' }} />
    <div>
      <UI.GraphTitle>{$t({ defaultMessage: 'Recommended' })}</UI.GraphTitle>
      <UI.GraphSubTitle>
        {$t({ defaultMessage: 'As of {dateTime}' }, {
          dateTime: formatter(DateFormatEnum.DateTimeFormat)(kpiData.data.timestamp)
        })}
      </UI.GraphSubTitle>
    </div>
    <div/>
  </UI.GraphTitleWrapper>
}

const GraphSubTitle = () => {
  const { $t } = useIntl()
  return <UI.GraphSubTitleWrapper>
    <div>
      <UI.GraphSubTitle>{`(${$t({ defaultMessage: 'Default' })})`}</UI.GraphSubTitle>
    </div>
    <div style={{ width: '24px' }} />
    <div>
      <UI.GraphSubTitle>{`(${$t({
        defaultMessage: 'Energy Saving projection'
      })})`}</UI.GraphSubTitle>
    </div>
    <div/>
  </UI.GraphSubTitleWrapper>
}

export const ComparisonDonutChart: React.FC<{
  kpiQuery: ReturnType<typeof useIntentAIEcoFlexQuery>
  isDetail?: boolean
}> = ({ kpiQuery, isDetail=false }) => {
  const { $t } = useIntl()
  const { state, isDataRetained } = useIntentContext()

  const noData = state === 'no-data'
  if (!isDataRetained) return <Card>{$t(dataRetentionText)}</Card>
  if (noData || !kpiQuery?.data) {
    return <Card>
      {$t({
        defaultMessage: 'Key Performance Indications will be generated once Intent is activated.'
      })}
    </Card>
  }

  return <Loader states={[kpiQuery]}>
    <UI.Wrapper isDetail={isDetail}>
      <Card>
        <UI.GraphWrapper data-testid='graph-wrapper'
          key={'graph-details'}
        >
          <DataGraph kpiData={kpiQuery.data} isDetail={isDetail} />
          {isDetail ? <GraphTitle kpiData={kpiQuery.data} /> : null}
        </UI.GraphWrapper>
        <div>
          {isDetail ? null: <GraphSubTitle /> }
        </div>
      </Card>
    </UI.Wrapper>
  </Loader>
}
