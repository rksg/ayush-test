import { Col, Row, Typography  }     from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { DiagramGallery }                            from './DiagramGallery'
import { messageMapping, prerequisitionListMessage } from './messageMapping'
import * as UI                                       from './styledComponents'

export const Prerequisition = () => {
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
          <UI.PrerequisiteListContiner>
            <ol>
              {prerequisitionListMessage.map((item, index) => {
                return <li key={index}>
                  <PrerequisitionFormBlock
                    title={item.title}
                    steps={item.steps}
                  />
                </li>
              })}
            </ol>
          </UI.PrerequisiteListContiner>
        </Col>
      </Row>
    </Col>

    <Col span={8}>
      <DiagramGallery />
    </Col>
  </Row>
}

const PrerequisitionFormBlock = (props: {
  title: { defaultMessage: string; },
  steps: { label: { defaultMessage: string; }; }[]
}) => {
  const { $t } = useIntl()
  const { title, steps } = props

  return <Row>
    <Col span={22}>
      <Typography.Title level={4}>{$t(title)}</Typography.Title>
      <UI.PrerequisiteListItemContiner>
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
      </UI.PrerequisiteListItemContiner>
    </Col>
  </Row>
}