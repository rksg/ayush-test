import { Col, Row, Typography  }     from 'antd'
import { isNil }                     from 'lodash'
import { useIntl, FormattedMessage } from 'react-intl'

import { cssNumber, Tooltip } from '@acx-ui/components'

import { DiagramGallery }                          from './DiagramGallery'
import { messageMapping, prerequisiteListMessage } from './messageMapping'
import * as UI                                     from './styledComponents'

export const Prerequisite = () => {
  const { $t } = useIntl()

  return <Row>
    <Col span={16}>
      <Row gutter={20}>
        <Col span={20}>
          <Typography.Paragraph>{$t(messageMapping.description)}</Typography.Paragraph>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={22}>
          <Typography.Title level={3}>{$t({ defaultMessage: 'Prerequisite' })}</Typography.Title>
          <UI.PrerequisiteListContainer>
            <ol>
              {prerequisiteListMessage.map((item, index) => {
                return <li key={index}>
                  <PrerequisiteFormBlock
                    title={item.title}
                    tooltip={item.tooltip}
                    steps={item.steps}
                  />
                </li>
              })}
            </ol>
          </UI.PrerequisiteListContainer>
        </Col>
      </Row>
    </Col>

    <Col span={8}>
      <DiagramGallery />
    </Col>
  </Row>
}

const PrerequisiteFormBlock = (props: {
  title: { defaultMessage: string; },
  tooltip?: { defaultMessage: string; },
  steps: { label: { defaultMessage: string; }; }[]
}) => {
  const { $t } = useIntl()
  const { title, tooltip, steps } = props

  return <Row>
    <Col span={22}>
      <Typography.Title level={4}
        style={{ fontWeight: cssNumber('--acx-headline-4-font-weight-bold') }}
      >
        {$t(title)}
        {!isNil(tooltip) && <Tooltip.Question
          title={$t(tooltip)}
          iconStyle={UI.questionIconStyle}/>}
      </Typography.Title>
      <UI.PrerequisiteListItemContainer>
        {steps.map((item, index) => <li key={index}>
          <Typography.Text>
            <FormattedMessage
              {...item.label}
              values={{
                b: (txt) => <b>{txt}</b>
              }}
            />
          </Typography.Text>
        </li>)}
      </UI.PrerequisiteListItemContainer>
    </Col>
  </Row>
}