import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'

import { StepsFormLegacy }                    from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import {
  useLazyGetEnhancedPortalProfileListQuery,
  useLazyGetEnhancedPortalTemplateListQuery } from '@acx-ui/rc/services'
import {
  Portal,
  checkObjectNotExists,
  hasGraveAccentAndDollarSign,
  useConfigTemplate,
  useConfigTemplateLazyQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useParams }   from '@acx-ui/react-router-dom'
import { TableResult } from '@acx-ui/utils'

import { PortalDemo } from '../PortalDemo'

const templatePayload = {
  fields: ['id', 'name'],
  filters: {},
  pageSize: 256
}

const PortalSettingForm = (props: { resetDemoField: () => void }) => {
  const { resetDemoField } = props
  const { $t } = useIntl()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [ getPortalList ] = useConfigTemplateLazyQueryFnSwitcher<TableResult<Portal>>({
    useLazyQueryFn: useLazyGetEnhancedPortalProfileListQuery,
    useLazyTemplateQueryFn: useLazyGetEnhancedPortalTemplateListQuery
  })
  const nameValidator = async (value: string) => {
    const list = await getPortalList({
      params, payload: { ...templatePayload },
      enableRbac: isEnabledRbacService }).unwrap()
    const result = list.data?.filter((n:Portal) => n.id !== params.serviceId)
      .map((n:Portal) => n.serviceName ?? n.name)

    return checkObjectNotExists(result, value, $t({ defaultMessage: 'Portal' }))
  }
  return (
    <>
      <Row gutter={20}>
        <Col span={10}>
          <StepsFormLegacy.Title>
            {$t({ defaultMessage: 'Settings' })}
          </StepsFormLegacy.Title>
          <Form.Item
            name={(isTemplate || isEnabledRbacService) ? 'name' : 'serviceName'}
            label={$t({ defaultMessage: 'Service Name' })}
            initialValue=''
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
