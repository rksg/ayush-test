/* eslint-disable max-len */

import { Col, Row, Typography } from 'antd'
import { useIntl }              from 'react-intl'

import { Loader, StepsForm } from '@acx-ui/components'

import { CompareSlider }        from '../../../CompareSlider'
import { Icon }                 from '../../common/IntentIcon'
import { IntroSummary }         from '../../common/IntroSummary'
import { aiFeatures }           from '../../config'
import { intentPriority }       from '../common'
import { useIntentAICRRMQuery } from '../RRMGraph/services'

import * as SideNotes from './SideNotes'
import * as UI        from './styledComponents'

const { Paragraph } = Typography

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
        <Icon feature={aiFeatures.RRM} size='xs' />
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

export function Introduction (
  { sliderUrlBefore, sliderUrlAfter, queryResult }:
  { sliderUrlBefore: string, sliderUrlAfter: string, queryResult: ReturnType<typeof useIntentAICRRMQuery> }) {
  const { $t } = useIntl()

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

  return <Row gutter={20}>
    <Col span={15}>
      <StepsForm.Title children={$t({ defaultMessage: 'Introduction' })} />
      <IntroSummary />
      <StepsForm.TextContent>
        <StepsForm.Subtitle>
          {$t({ defaultMessage: 'Network Intent plays a crucial role in wireless network design' })}
        </StepsForm.Subtitle>
        <Paragraph>
          <b>{$t(intentPriority.full.title)}:</b> <span>{$t(intentPriority.full.content)}</span>
        </Paragraph>
        <Paragraph>
          <b>{$t(intentPriority.partial.title)}:</b> <span>{$t(intentPriority.partial.content)}</span>
        </Paragraph>
      </StepsForm.TextContent>
      {compareSlider}
    </Col>
    <Col span={7} offset={2}>
      <SideNotes.Introduction />
    </Col>
  </Row>
}
