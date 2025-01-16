/* eslint-disable max-len */
import { useState } from 'react'

import { Col, Row }                  from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Loader, StepsForm } from '@acx-ui/components'

import { CompareSlider }                       from '../../../CompareSlider'
import { Icon }                                from '../../common/IntentIcon'
import { IntroSummary }                        from '../../common/IntroSummary'
import { richTextFormatValues }                from '../../common/richTextFormatValues'
import { AiFeatures }                          from '../../config'
import { useIntentContext }                    from '../../IntentContext'
import { SliderGraphAfter, SliderGraphBefore } from '../RRMGraph'
import { useIntentAICRRMQuery }                from '../RRMGraph/services'

import * as SideNotes from './SideNotes'
import * as UI        from './styledComponents'

export const SliderBefore = (props: { image: string }) => {
  const { $t } = useIntl()
  return (
    <UI.SliderBefore>
      <UI.LabelStyleBefore>{($t({ defaultMessage: 'Current' }))}</UI.LabelStyleBefore>
      <img
        src={props.image}
        alt='imageBefore'
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      />
    </UI.SliderBefore>
  )
}

export const SliderAfter = (props: { image: string }) => {
  const { $t } = useIntl()
  return (
    <UI.SliderAfter>
      <UI.LabelStyleAfter>
        <span>{($t({ defaultMessage: 'Forecast' }))}</span>
        <span>{($t({ defaultMessage: 'with' }))}</span>
        <Icon feature={AiFeatures.RRM} size='xs' />
      </UI.LabelStyleAfter>
      <img
        src={props.image}
        alt='imageAfter'
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      />
    </UI.SliderAfter>
  )
}

export function Introduction () {
  const { $t } = useIntl()
  const { isDataRetained, isHotTierData } = useIntentContext()

  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!
  const [sliderUrlBefore, setSliderUrlBefore] = useState<string>('')
  const [sliderUrlAfter, setSliderUrlAfter] = useState<string>('')

  const compareSlider = <Loader states={[queryResult]}>
    <CompareSlider
      style={{ width: '40%', height: '100%' }}
      itemOne={<SliderBefore image={sliderUrlBefore} />}
      itemTwo={<SliderAfter image={sliderUrlAfter} />}
      disabled={false}
      portrait={false}
      boundsPadding={0}
      position={50}
      changePositionOnHover={false}
      keyboardIncrement={0}
      onlyHandleDraggable={false}
    />
  </Loader>

  return <>
    {crrmData && <div hidden data-testid='hidden-graph'>
      <SliderGraphBefore crrmData={crrmData} setUrl={setSliderUrlBefore} />
      <SliderGraphAfter crrmData={crrmData} setUrl={setSliderUrlAfter} />
    </div>}
    <Row gutter={20}>
      <Col span={15}>
        <StepsForm.Title children={$t({ defaultMessage: 'Introduction' })} />
        <IntroSummary />
        <StepsForm.TextContent>
          <StepsForm.Subtitle>
            <FormattedMessage defaultMessage='Network Intent plays a crucial role in wireless network design' />
          </StepsForm.Subtitle>
          <FormattedMessage
            values={richTextFormatValues}
            defaultMessage={`
              <p><b>Optimize Channel Plan for:</b></p>
              <p>
                <b>High number of clients in a dense network:</b>
                High client density network requires low interfering channels which fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.
              </p>

              <p>
                <b>High client throughput in sparse network:</b>
                In sparse networks with high client throughput, moderate interference is manageable due to optimized resource allocation, minimal competition for bandwidth, and strong signal strength. This allows for stable connections and satisfactory performance, outweighing drawbacks of interference.
              </p>
              <br></br>
            `}
          />
        </StepsForm.TextContent>
        {isDataRetained && isHotTierData && compareSlider}
      </Col>
      <Col span={7} offset={2}>
        <SideNotes.Introduction />
      </Col>
    </Row>
  </>
}
