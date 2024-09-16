/* eslint-disable max-len */

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { cssStr, DonutChart, DonutChartData, StepsForm } from '@acx-ui/components'
import { formatter }                                     from '@acx-ui/formatter'

import { CompareSlider }    from '../../../CompareSlider'
import { Icon }             from '../../common/IntentIcon'
import { IntroSummary }     from '../../common/IntroSummary'
import { aiFeatures }       from '../../config'
import { useIntentContext } from '../../IntentContext'

import * as SideNotes from './SideNotes'
import * as UI        from './styledComponents'

const { Paragraph } = Typography

const ecoFlexDataBefore: DonutChartData[] = [
  { value: 10,
    name: '10 APs (16%) are not supporting EcoFlex',
    color: cssStr('--acx-accents-blue-30') },
  { value: 50,
    name: '20 APs (33%) are supporting and disabling EcoFlex',
    color: cssStr('--acx-accents-orange-30') }
]

const ecoFlexDataAfter: DonutChartData[] = [
  { value: 10,
    name: '10 APs (16%) are not supporting EcoFlex',
    color: cssStr('--acx-accents-blue-30') },
  { value: 20,
    name: '20 APs (33%) are supporting and disabling EcoFlex',
    color: cssStr('--acx-accents-orange-30') },
  { value: 30,
    name: '30 APs (50%) are supporting and enabling EcoFlex',
    color: cssStr('--acx-semantics-green-30') }
]

const ChartBefore = () => {
  const { $t } = useIntl()
  return (
    <DonutChart
      showLegend={false}
      style={{ width: 200, height: 200 }}
      title={$t({ defaultMessage: '0 APs (0%) are supporting and enabling EcoFlex' })}
      showTotal={false}
      dataFormatter={formatter('countFormat')}
      data={ecoFlexDataBefore}
    />
  )
}

export const SliderBeforeTest = () => {
  const { $t } = useIntl()
  return (
    <UI.SliderBefore>
      <UI.LabelStyleBefore>{($t({ defaultMessage: 'Current' }))}</UI.LabelStyleBefore>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <ChartBefore />
      </div>
    </UI.SliderBefore>
  )
}

const ChartAfter = () => {
  const { $t } = useIntl()
  return (
    <DonutChart
      showLegend={false}
      style={{ width: 200, height: 200 }}
      title={$t({ defaultMessage: '30 APs (50%) are supporting and enabling EcoFlex' })}
      showTotal={false}
      dataFormatter={formatter('countFormat')}
      data={ecoFlexDataAfter}
    />
  )
}

export const SliderAfterTest = () => {
  const { $t } = useIntl()
  return (
    <UI.SliderAfter>
      <UI.LabelStyleAfter>
        <span>{($t({ defaultMessage: 'Forecast' }))}</span>
        <span>{($t({ defaultMessage: 'with' }))}</span>
        <Icon feature={aiFeatures.EcoFlex} size='xs' />
      </UI.LabelStyleAfter>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
        <ChartAfter />
      </div>
    </UI.SliderAfter>
  )
}

export function Introduction (
) {
  const { $t } = useIntl()
  const title1 = $t({ defaultMessage: 'Reduction in energy footprint' })
  const para1 = $t({ defaultMessage: 'Enable PowerSave mode for few access points during off-peak hours to conserve energy. This approach may involve some compromises, but overall service quality remains unaffected during these periods.' })
  const title2 = $t({ defaultMessage: 'Operation of the mission critical network' })
  const para2 = $t({ defaultMessage: 'Maintain all access points at normal power continuously to ensure maximum reliability and performance for critical applications, guaranteeing uninterrupted, high-quality connectivity essential for mission-critical operations.' })
  const { isDataRetained: showData } = useIntentContext()
  const compareSlider = <CompareSlider
    style={{ width: '40%', height: '100%' }}
    // TODO: maybe we should follow RRM intentAIForm sample to use imageURL solution?
    // itemOne={<SliderBefore image={sliderUrlBefore} />}
    // itemTwo={<SliderAfter image={sliderUrlAfter} />}
    itemOne={<SliderBeforeTest />}
    itemTwo={<SliderAfterTest />}
    disabled={false}
    portrait={false}
    boundsPadding={0}
    position={50}
    changePositionOnHover={false}
    keyboardIncrement={0}
    onlyHandleDraggable={false}
  />

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
      {showData && compareSlider}
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Introduction />
    </Col>
  </Row>
}
