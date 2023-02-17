import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsForm }                                         from '@acx-ui/components'
import { useLazyGetPortalProfileListQuery }                  from '@acx-ui/rc/services'
import { checkObjectNotExists, hasGraveAccentAndDollarSign } from '@acx-ui/rc/utils'
import { useParams }                                         from '@acx-ui/react-router-dom'

import PortalDemo from '../PortalDemo'


const PortalSettingForm = (props:{
  resetDemoField: () => void
}) => {
  const { resetDemoField } = props
  const { $t } = useIntl()
  const [getPortalList] = useLazyGetPortalProfileListQuery()
  const params = useParams()

  const nameValidator = async (value: string) => {
    const list = (await getPortalList({ params }, true).unwrap()).data
      .filter(n => n.id !== params.serviceId)
      .map(n => n.serviceName)

    return checkObjectNotExists(list, value, $t({ defaultMessage: 'Portal' }))
  }
  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
          <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
          <Form.Item
            name='serviceName'
            label={$t({ defaultMessage: 'Service Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => nameValidator(value) },
              { validator: (_, value) => hasGraveAccentAndDollarSign(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
        </Col>
      </Row>
      <Row>
        <Col flex={1}>
          <Form.Item
            name='content'
            label={$t({ defaultMessage: 'Portal Design' })}
            children={<PortalDemo resetDemo={() => resetDemoField()}/>}
          />
        </Col>
      </Row>
    </>
  )
}

export default PortalSettingForm
