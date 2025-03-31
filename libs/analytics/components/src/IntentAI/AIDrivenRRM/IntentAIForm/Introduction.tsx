/* eslint-disable max-len */
import { Col, Row }                  from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Tabs } from '@acx-ui/components'

import { IntroSummary }         from '../../common/IntroSummary'
import { richTextFormatValues } from '../../common/richTextFormatValues'
import { useIntentContext }     from '../../IntentContext'
import ChannelDistributionChart from '../Chart/ChannelDistributionChart'
import PowerTransmissionChart   from '../Chart/PowerTransmissionChart'
import { IntentAIRRMGraph }     from '../RRMGraph'

import * as SideNotes from './SideNotes'
import * as UI        from './styledComponents'

export function Introduction () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const isFullOptimization = _.get(intent, ['metadata', 'preferences', 'crrmFullOptimization'])

  return <Row gutter={20}>
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
      <StepsForm.TextContent>
        <StepsForm.Subtitle children={<FormattedMessage defaultMessage='Projection'/>}/>
        <Tabs>
          <Tabs.TabPane tab='Interfering Links' key='interfering-links'>
            <IntentAIRRMGraph isFullOptimization={isFullOptimization}/>
          </Tabs.TabPane>
        </Tabs>
      </StepsForm.TextContent>
      <UI.ChartWrapper>
        <ChannelDistributionChart {...intent} />
      </UI.ChartWrapper>
      <UI.ChartWrapper>
        <PowerTransmissionChart {...intent} />
      </UI.ChartWrapper>
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Introduction />
    </Col>
  </Row>
}
