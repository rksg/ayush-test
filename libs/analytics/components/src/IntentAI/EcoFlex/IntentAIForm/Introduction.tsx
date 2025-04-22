/* eslint-disable max-len */

import { Col, Row, Typography }   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { cssNumber, cssStr, DonutChart, DonutChartData, Loader, StepsForm } from '@acx-ui/components'

import { CompareSlider }                              from '../../../CompareSlider'
import { Icon }                                       from '../../common/IntentIcon'
import { IntroSummary }                               from '../../common/IntroSummary'
import { AiFeatures }                                 from '../../config'
import { useIntentContext }                           from '../../IntentContext'
import { KpiDonutChartData, useIntentAIEcoFlexQuery } from '../ComparisonDonutChart/services'

import * as SideNotes from './SideNotes'
import * as UI        from './styledComponents'

const { Paragraph } = Typography

const titleMsgWithApCount = defineMessage({
  defaultMessage: `{apCount} {apCount, plural,
    one {AP}
    other {APs}
  } ({percentValue}%)`
})

const secondTitleMsgWithApCount = defineMessage({
  defaultMessage: `{apCount, plural,
    one {is}
    other {are}
  } supporting and enabling Energy Saving`
})

export const RenderDonutChart: React.FC<{
  data: DonutChartData[],
  titleColor: 'black' | 'white' | undefined
}> = ({ data, titleColor }) => {
  const { $t } = useIntl()
  const enabledApCount = data[2]?.value || 0
  const sum = data.reduce((sum, { value }) => sum + value, 0)
  const percentValue = sum ? (enabledApCount / sum) * 100 : 0
  const titleMsg = data.length === 0 ? '' : $t(titleMsgWithApCount, {
    apCount: enabledApCount,
    percentValue: percentValue.toFixed(0)
  })
  const secondTitleMsg = data.length === 0 ? '' : $t(secondTitleMsgWithApCount, {
    apCount: enabledApCount
  })
  const commonFontStyle = {
    color: titleColor === 'white' ? cssStr('--acx-primary-white') : cssStr('--acx-primary-black'),
    fontFamily: cssStr('--acx-neutral-brand-font'),
    width: 100,
    overflow: 'break' as const
  }
  const boldFontStyle = {
    ...commonFontStyle,
    fontSize: cssNumber('--acx-headline-5-font-size'),
    lineHeight: cssNumber('--acx-headline-5-line-height'),
    fontWeight: cssNumber('--acx-headline-5-font-weight-bold')
  }
  const nonBoldFontStyle = {
    ...commonFontStyle,
    fontSize: cssNumber('--acx-headline-5-font-size'),
    lineHeight: cssNumber('--acx-headline-5-line-height'),
    fontWeight: cssNumber('--acx-headline-5-font-weight')
  }

  return (
    <DonutChart
      showLegend={false}
      style={{ width: 200, height: 200 }}
      showTotal={false}
      data={data}
      title={titleMsg}
      titleColor={titleColor}
      value={secondTitleMsg}
      titleTextStyle={boldFontStyle}
      secondaryTitleTextStyle={nonBoldFontStyle}
      isShowTooltip={false}
    />
  )
}

export const SliderBefore: React.FC<{ kpiData: KpiDonutChartData }> = ({ kpiData }) => {
  const { $t } = useIntl()
  return (
    <UI.SliderBefore>
      <div style={{
        width: '20%'
      }}>
        <UI.LabelStyleBefore>
          <span>{($t({ defaultMessage: 'Mission' }))}</span>
          <span>{($t({ defaultMessage: 'criticality' }))}</span>
        </UI.LabelStyleBefore>
      </div>
      <div style={{
        width: '100%'
      }}>
        <RenderDonutChart data={kpiData.data} titleColor='white' />
      </div>
    </UI.SliderBefore>
  )
}

export const SliderAfter: React.FC<{ kpiData: KpiDonutChartData }> = ({ kpiData }) => {
  const { $t } = useIntl()
  return (
    <UI.SliderAfter>
      <div style={{
        width: '20%'
      }}></div>
      <div style={{
        width: '100%'
      }}>
        <RenderDonutChart data={kpiData.data} titleColor='black' />
      </div>
      <UI.LabelStyleAfter>
        <span>{($t({ defaultMessage: 'Energy' }))}</span>
        <span>{($t({ defaultMessage: 'footprint' }))}</span>
        <span>{($t({ defaultMessage: 'with' }))}</span>
        <Icon feature={AiFeatures.EcoFlex} size='xs' />
      </UI.LabelStyleAfter>
    </UI.SliderAfter>
  )
}

const CompareSliderWithEcoFlex: React.FC<ReturnType<typeof useIntentAIEcoFlexQuery>> = (kpiQuery) => {
  return !kpiQuery.data ? null : (
    <Loader states={[kpiQuery]}>
      <CompareSlider
        style={{ width: '300px', height: '100%' }}
        itemOne={<SliderBefore kpiData={kpiQuery.data.compareData} />}
        itemTwo={<SliderAfter kpiData={kpiQuery.data.data} />}
        disabled={false}
        portrait={false}
        boundsPadding={0}
        position={50}
        changePositionOnHover={false}
        keyboardIncrement={0}
        onlyHandleDraggable={false}
      />
    </Loader>
  )
}

export const Introduction: React.FC<{
  kpiQuery: ReturnType<typeof useIntentAIEcoFlexQuery>
}> = ({ kpiQuery }) => {
  const { $t } = useIntl()
  const title1 = $t({ defaultMessage: 'Reduction in energy footprint' })
  const para1 = $t({ defaultMessage: 'Enable PowerSave mode for few access points during off-peak hours to conserve energy. This approach may involve some compromises, but overall service quality remains unaffected during these periods.' })
  const title2 = $t({ defaultMessage: 'Operation of the mission critical network' })
  const para2 = $t({ defaultMessage: 'Maintain all access points at normal power continuously to ensure maximum reliability and performance for critical applications, guaranteeing uninterrupted, high-quality connectivity essential for mission-critical operations.' })
  const { isDataRetained: showData } = useIntentContext()

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Introduction' })} />
      <IntroSummary />
      <StepsForm.TextContent>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Network Intent plays a crucial role in wireless network design' })}
        </StepsForm.Subtitle>
        <Paragraph>
          <b>{title1}:</b> <span>{para1}</span>
        </Paragraph>
        <Paragraph>
          <b>{title2}:</b> <span>{para2}</span>
        </Paragraph>
      </StepsForm.TextContent>
      {showData && <CompareSliderWithEcoFlex {...kpiQuery} />}
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Introduction />
    </Col>
  </Row>
}
