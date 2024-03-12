import { useEffect, useState } from 'react'

import { Row, Col, Form, Select, Input } from 'antd'
import { useIntl }                       from 'react-intl'

import { Button, Tabs }                                                           from '@acx-ui/components'
import { useGetCertificateAuthoritiesQuery, useLazyGetCertificateTemplatesQuery } from '@acx-ui/rc/services'
import { checkObjectNotExists, trailingNorLeadingSpaces }                         from '@acx-ui/rc/utils'
import { useParams }                                                              from '@acx-ui/react-router-dom'

import { MAX_CERTIFICATE_PER_TENANT }                                           from '../certificateTemplateUtils'
import { onboardSettingsDescription }                                           from '../contentsMap'
import { Description, Section, SettingsSectionTitle, TabItem, TabLable, Title } from '../styledComponents'

import AddCertificateAuthorityDrawer from './AddCertificateAuthorityDrawer'
import CertificateStrengthSettings   from './CertificateTemplateSettings/CertificateStrengthSettings'
import OrganizationInfoSettings      from './CertificateTemplateSettings/OrganizationInfoSettings'
import ValidityPeriodSettings        from './CertificateTemplateSettings/ValidityPeriodSettings'

export default function OnboardForm ({ editMode = false }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const selectedCaId = Form.useWatch(['onboard', 'certificateAuthorityId'], form)
  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const { policyId } = useParams()
  const moreSettingsTabsInfo = [
    {
      key: 'validityPeriod',
      display: $t({ defaultMessage: 'Validity Period' }),
      content: <ValidityPeriodSettings />
    },
    {
      key: 'certificateStrength',
      display: $t({ defaultMessage: 'Certificate Strength' }),
      content: <CertificateStrengthSettings />
    },
    {
      key: 'organizationInfo',
      display: $t({ defaultMessage: 'Organization Info' }),
      content: <OrganizationInfoSettings />
    }
  ]
  const [activeTabKey, setActiveTabKey] = useState(moreSettingsTabsInfo[0].key)
  const [getCertificateTemplateList] = useLazyGetCertificateTemplatesQuery()
  const { isCaOptionsLoading, caOptions } = useGetCertificateAuthoritiesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isCaOptionsLoading: isLoading,
        caOptions: data?.data?.map((item) => ({ label: item.name, value: item.id }))
      }
    }
  })

  const nameValidator = async (value: string) => {
    try {
      const list = (await getCertificateTemplateList({
        payload: { page: 1, pageSize: MAX_CERTIFICATE_PER_TENANT }
      }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))

      return checkObjectNotExists(list, { name: value },
        $t({ defaultMessage: 'Certificate Template' }))
    } catch {
      return Promise.reject($t({ defaultMessage: 'Validation error' }))
    }
  }

  useEffect(() => {
    const optionLabel = caOptions
      ? caOptions.filter(option => option.value === selectedCaId).map(option => option.label)
      : selectedCaId
    form.setFieldValue(['onboard', 'certificateAuthorityName'], optionLabel)
  }, [selectedCaId])

  return (
    <>
      <Row style={{ marginBottom: '24px' }}>
        <Col>
          <Title>{$t({ defaultMessage: 'Onboard CA' })}</Title>
          <Description>{$t(onboardSettingsDescription.INFORMATION)}</Description>
        </Col>
      </Row>
      <Section>
        <Row>
          <Col span={24}>
            <SettingsSectionTitle>{$t({ defaultMessage: 'CA Sources' })}</SettingsSectionTitle>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <Form.Item
              name={['onboard', 'certificateAuthorityId']}
              label={$t({ defaultMessage: 'Onboard Certificate Authority' })}
              rules={[{
                required: true
              }]}
            >
              <Select
                loading={isCaOptionsLoading}
                placeholder={$t({ defaultMessage: 'Select CA...' })}
                options={caOptions}
                disabled={editMode}
              />
            </Form.Item>
          </Col>
          {!editMode && <AddCertificateAuthorityDrawer certificateTemplateForm={form} />}
        </Row>
      </Section>
      <Section>
        <Row>
          <Col span={24}>
            <SettingsSectionTitle>
              {$t({ defaultMessage: 'Certificate Template Information' })}
            </SettingsSectionTitle>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Certificate Template Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => nameValidator(value) }
              ]}
              validateTrigger={'onBlur'}
              validateFirst
            >
              <Input placeholder='BYOD Template' />
            </Form.Item>
            <Form.Item
              name={['onboard', 'commonNamePattern']}
              label={$t({ defaultMessage: 'Common Name' })}
              extra={$t(onboardSettingsDescription.CERTIFICATE_TEMPLATE_NAME)}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              validateTrigger={'onBlur'}
              validateFirst>
              <Input placeholder='${USERNAME}@byod.company.com' />
            </Form.Item>
          </Col>
        </Row >
      </Section>
      <Row>
        <Col span={10}>
          <Button type='link' onClick={() => setShowMoreSettings(!showMoreSettings)}>
            {showMoreSettings
              ? $t({ defaultMessage: 'Show less settings' })
              : $t({ defaultMessage: 'Show more settings' })}
          </Button>
          {showMoreSettings && <>
            <Tabs type='third'
              onChange={(key) => setActiveTabKey(key)}
              activeKey={activeTabKey}
            >
              {moreSettingsTabsInfo.map(({ key, display }) =>
                (<Tabs.TabPane key={key} tab={<TabLable>{display}</TabLable>} />))}
            </Tabs>
            <TabItem>
              {moreSettingsTabsInfo.find(info => (info.key === activeTabKey))?.content}
            </TabItem>
          </>
          }
        </Col >
      </Row>
    </>
  )
}
