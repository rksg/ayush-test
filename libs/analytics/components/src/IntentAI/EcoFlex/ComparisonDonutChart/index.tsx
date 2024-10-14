
import { defineMessage, useIntl } from 'react-intl'

import {
  Card,
  DonutChart
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { useIntentContext }  from '../../IntentContext'
import { dataRetentionText } from '../../utils'

import { Legend }  from './Legend'
import { KpiData } from './services'
import * as UI     from './styledComponents'

function DataGraph ({ kpiData, isDetail }: { kpiData: KpiData, isDetail: boolean }) {
  if (!kpiData) return null

  const tooltipFormat = defineMessage({
    defaultMessage: ` <b>{formattedValue} {value, plural,
      one {AP}
      other {APs}
      } ({formattedPercent})</b> {value, plural,
      one {is}
      other {are}
    } {name}`
  })

  const width = isDetail ? 160 : 120
  const height = width

  return <>
    <UI.DonutChartWrapper isDetail={isDetail}>
      <DonutChart
        showLegend={false}
        style={{ width , height }}
        showTotal={false}
        tooltipFormat={tooltipFormat}
        dataFormatter={formatter('countFormat')}
        data={kpiData.compareData.data}
        size={'large'}
      />
    </UI.DonutChartWrapper>
    <UI.ArrowWrapper children={<UI.RightArrow/>} />
    <UI.DonutChartWrapper isDetail={isDetail}>
      <DonutChart
        showLegend={false}
        style={{ width, height }}
        showTotal={false}
        tooltipFormat={tooltipFormat}
        dataFormatter={formatter('countFormat')}
        data={kpiData.data.data}
        size={'large'}
      />
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
      <UI.GraphSubTitle>{`(${$t({ defaultMessage: 'EcoFlex projection' })})`}</UI.GraphSubTitle>
    </div>
    <div/>
  </UI.GraphSubTitleWrapper>
}

export const ComparisonDonutChart: React.FC<{
  kpiData?: KpiData
  isDetail?: boolean
}> = ({ kpiData, isDetail=false }) => {
  const { $t } = useIntl()
  const { state, isDataRetained } = useIntentContext()

  const noData = state === 'no-data'
  if (!isDataRetained) return <Card>{$t(dataRetentionText)}</Card>
  if (noData || !kpiData) {
    return <Card>
      {$t({ defaultMessage: 'Graph modeling will be generated once Intent is activated.' })}
    </Card>
  }

  return <UI.Wrapper isDetail={isDetail}>
    <Card>
      <UI.GraphWrapper data-testid='graph-wrapper'
        key={'graph-details'}
      >
        <DataGraph kpiData={kpiData} isDetail={isDetail} />
        {isDetail ? null: <GraphSubTitle /> }
        {isDetail ? <GraphTitle kpiData={kpiData} /> : null}
      </UI.GraphWrapper>
    </Card>
  </UI.Wrapper>
}