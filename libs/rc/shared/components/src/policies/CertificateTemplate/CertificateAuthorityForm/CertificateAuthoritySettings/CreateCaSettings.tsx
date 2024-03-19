import { Row, Col, Form, Input, Select } from 'antd'
import moment                            from 'moment'
import { useIntl }                       from 'react-intl'

import { DatePicker }                                                               from '@acx-ui/components'
import { useGetCertificateAuthoritiesQuery, useLazyGetCertificateAuthoritiesQuery } from '@acx-ui/rc/services'
import { trailingNorLeadingSpaces, CertificateCategoryType, checkObjectNotExists }  from '@acx-ui/rc/utils'

import CertificateStrengthSettings                           from '../../CertificateTemplateForm/CertificateTemplateSettings/CertificateStrengthSettings'
import OrganizationInfoSettings                              from '../../CertificateTemplateForm/CertificateTemplateSettings/OrganizationInfoSettings'
import { MAX_CERTIFICATE_PER_TENANT }                        from '../../constants'
import { caFormDescription }                                 from '../../contentsMap'
import { SettingsSectionTitle, Description, Section, Title } from '../../styledComponents'



export default function CreateCaSettings ({ rootCaMode = true }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [getCertificateAuthorities] = useLazyGetCertificateAuthoritiesQuery()
  const { isCaOptionsLoading, caOptions } = useGetCertificateAuthoritiesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isCaOptionsLoading: isLoading,
        caOptions: data?.data?.filter((item) => item.privateKeyBase64)
          .map((item) => ({ label: item.name, value: item.id }))
      }
    }
  })

  const nameValidator = async (value: string) => {
    try {
      const payload = { page: 1, pageSize: MAX_CERTIFICATE_PER_TENANT }
      const list = (await getCertificateAuthorities({ payload }).unwrap())
        .data.map(n => ({ name: n.name }))
      const entityName = $t({ defaultMessage: 'Certificate Authority' })
      return checkObjectNotExists(list, { name: value }, entityName)
    } catch {
      return Promise.reject($t({ defaultMessage: 'Validation error' }))
    }
  }

  function validateStartAndExpirationDate (): void | Promise<void> {
    const notBefore = form.getFieldValue('startDateMoment')
    const notAfter = form.getFieldValue('expireDateMoment')
    if (notBefore && notAfter && moment(notBefore).isSameOrAfter(moment(notAfter))) {
      return Promise.reject($t({ defaultMessage: 'Start Date should be before Expiration Date' }))
    }
    return Promise.resolve()
  }

  return (
    <>
      <Title>{rootCaMode ? $t({ defaultMessage: 'Create Root CA' }) :
        $t({ defaultMessage: 'Create Intermediate CA' })}</Title>
      {
        !rootCaMode &&
        <Section>
          <Row>
            <Col span={10}>
              <Form.Item
                name={'caId'}
                label={$t({ defaultMessage: 'Certificate Authority' })}
                rules={[{
                  required: true
                }]}
              >
                <Select
                  loading={isCaOptionsLoading}
                  placeholder={$t({ defaultMessage: 'Select CA...' })}
                  options={caOptions}
                />
              </Form.Item>
            </Col>
          </Row>
        </Section>
      }
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Information' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.INFORMATION)}</Description>
        <Row>
          <Col span={10}>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Certificate Authority Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => nameValidator(value) }
              ]}
              validateTrigger={'onBlur'}
              validateFirst
              children={<Input />}
            />
            <Form.Item
              name='commonName'
              label={$t({ defaultMessage: 'Common Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={$t({ defaultMessage: 'Description' })}
              rules={[
                { max: 255 }
              ]}
              children={<Input />}
            />
          </Col>
        </Row>
      </Section>
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'Validity Period' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.VALIDITY_PERIOD)}</Description>
        <Row>
          <Col span={10}>
            <Form.Item label={$t({ defaultMessage: 'Start Date' })}
              name={'startDateMoment'}
              rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Expiration Date' })}
              name={'expireDateMoment'}
              rules={[
                { required: true },
                { validator: () => validateStartAndExpirationDate() }]}>
              <DatePicker
                disabledDate={current => current && current < moment().endOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>
      </Section>
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Strength' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.STRENGTH)}</Description>
        <Row>
          <Col span={10}>
            <CertificateStrengthSettings />
          </Col>
        </Row>
      </Section>
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Properties' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.PROPERTIES)}</Description>
        <Row>
          <Col span={10}>
            <OrganizationInfoSettings type={CertificateCategoryType.CERTIFICATE_AUTHORITY} />
          </Col>
        </Row>
      </Section>
    </>
  )
}
