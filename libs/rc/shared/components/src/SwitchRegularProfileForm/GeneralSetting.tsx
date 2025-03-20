import { useContext, useEffect } from 'react'

import { Row, Col, Form, Input } from 'antd'
import TextArea                  from 'antd/lib/input/TextArea'
import { useIntl }               from 'react-intl'

import { StepsFormLegacy }                               from '@acx-ui/components'
import { Features, useIsSplitOn }                        from '@acx-ui/feature-toggle'
import {
  useLazyValidateUniqueProfileNameQuery,
  useLazyValidateUniqueSwitchProfileTemplateNameQuery
} from '@acx-ui/rc/services'
import {
  SwitchProfile,
  TableResult,
  checkObjectNotExists,
  useConfigTemplate,
  useConfigTemplateLazyQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { ConfigurationProfileFormContext } from './ConfigurationProfileFormContext'

const profileListPayload = {
  url: '/api/viewmodel/{tenantId}/switch/profilelist',
  searchString: '',
  searchTargetFields: ['name'],
  fields: ['name', 'id'],
  pageSize: 10000,
  filters: {}
}

export function GeneralSetting () {
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const { isTemplate } = useConfigTemplate()
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const { $t } = useIntl()
  const params = useParams()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  // eslint-disable-next-line max-len
  const [validateUniqueProfileName] = useConfigTemplateLazyQueryFnSwitcher<TableResult<SwitchProfile>>({
    useLazyQueryFn: useLazyValidateUniqueProfileNameQuery,
    useLazyTemplateQueryFn: useLazyValidateUniqueSwitchProfileTemplateNameQuery
  })
  const nameValidator = async (value: string) => {
    const payload = { ...profileListPayload, searchString: value }
    const list = (await validateUniqueProfileName({
      params,
      payload,
      enableRbac: isTemplate ? isConfigTemplateRbacEnabled: isSwitchRbacEnabled
    }, true).unwrap()).data
      .filter(n => n.id !== params.profileId)
      .map(n => n.name)

    return checkObjectNotExists(list, value, $t({ defaultMessage: 'Configuration Profile' }))
  }

  useEffect(() => {
    if(currentData){
      form.setFieldsValue(currentData)
    }
  }, [currentData])

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title
          children={$t({ defaultMessage: 'General Properties' })}
        />
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { max: 64 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          hasFeedback
          validateFirst
          validateTrigger={'onBlur'}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Profile Description' })}
          initialValue={''}
        >
          <TextArea rows={4} maxLength={64} />
        </Form.Item>
        <Form.Item
          name='id'
          hidden={true}
          initialValue={null}
          children={<Input />}
        />
      </Col>
    </Row>
  )
}
