import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsFormLegacy }                    from '@acx-ui/components'
import {
  useLazyGetPortalProfileListQuery,
  useLazyGetEnhancedPortalTemplateListQuery
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  hasGraveAccentAndDollarSign,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { PortalDemo } from '../PortalDemo'

const templatePayload = () => ({
  fields: ['id', 'name'],
  filters: {},
  pageSize: 1024
})

const PortalSettingForm = (props: { resetDemoField: () => void }) => {
  const { resetDemoField } = props
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const [ getPortalList ] = useLazyGetPortalProfileListQuery()
  const [ getPortalTemplateList ] = useLazyGetEnhancedPortalTemplateListQuery()

  const nameValidator = async (value: string) => {
    const list = !isTemplate ? (await getPortalList({ params }, true).unwrap()).data
      .filter((n) => n.id !== params.serviceId)
      .map((n) => n.serviceName):
      (await getPortalTemplateList(
        { params, payload: templatePayload()
        }, true)
        .unwrap()).data
        .filter((n) => n.id !== params.serviceId)
        .map((n) => n.name)

    return checkObjectNotExists(list, value, $t({ defaultMessage: 'Portal' }))
  }
  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
          <StepsFormLegacy.Title>
            {$t({ defaultMessage: 'Settings' })}
          </StepsFormLegacy.Title>
          <Form.Item
            name={isTemplate ? 'name': 'serviceName'}
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 255 },
              { validator: (_, value) => nameValidator(value) },
              { validator: (_, value) => hasGraveAccentAndDollarSign(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
            validateTrigger={'onBlur'}
          />
        </Col>
      </Row>
      <Row>
        <Col flex={1}>
          <Form.Item
            name='content'
            label={$t({ defaultMessage: 'Portal Design' })}
            children={<PortalDemo resetDemo={() => resetDemoField()} />}
          />
        </Col>
      </Row>
    </>
  )
}

export default PortalSettingForm
