import { Form, Input, Select } from 'antd'
import moment                  from 'moment'
import { useIntl }             from 'react-intl'

import { DatePicker, GridCol, GridRow }                                            from '@acx-ui/components'
import { useGetCertificateAuthoritiesQuery }                                       from '@acx-ui/rc/services'
import { trailingNorLeadingSpaces, CertificateCategoryType, checkObjectNotExists } from '@acx-ui/rc/utils'

import CertificateStrengthSettings                           from '../../CertificateTemplateForm/CertificateTemplateSettings/CertificateStrengthSettings'
import OrganizationInfoSettings                              from '../../CertificateTemplateForm/CertificateTemplateSettings/OrganizationInfoSettings'
import { MAX_CERTIFICATE_PER_TENANT }                        from '../../constants'
import { caFormDescription }                                 from '../../contentsMap'
import { SettingsSectionTitle, Description, Section, Title } from '../../styledComponents'



export default function CreateCaSettings ({ rootCaMode = true }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { isCaNameListLoading, caNameList } = useGetCertificateAuthoritiesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isCaNameListLoading: isLoading,
        caNameList: data?.data?.map((item) =>
          ({ label: item.name, value: item.id, privateKeyBase64: item.privateKeyBase64 }))
      }
    }
  })

  const nameValidator = async (value: string) => {
    if (caNameList) {
      const list = caNameList.map(n => ({ name: n.label }))
      const entityName = $t({ defaultMessage: 'Certificate Authority' })
      return checkObjectNotExists(list, { name: value }, entityName)
    } else {
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
          <GridRow>
            <GridCol col={{ span: 10 }}>
              <Form.Item
                name={'caId'}
                label={$t({ defaultMessage: 'Certificate Authority' })}
                rules={[{
                  required: true
                }]}
              >
                <Select
                  loading={isCaNameListLoading}
                  placeholder={$t({ defaultMessage: 'Select CA...' })}
                  options={caNameList?.filter((item) => item.privateKeyBase64)}
                />
              </Form.Item>
            </GridCol>
          </GridRow>
        </Section>
      }
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Information' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.INFORMATION)}</Description>
        <GridRow>
          <GridCol col={{ span: 10 }} >
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
                { max: 64 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
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
          </GridCol>
        </GridRow>
      </Section>
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'Validity Period' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.VALIDITY_PERIOD)}</Description>
        <GridRow>
          <GridCol col={{ span: 10 }} >
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
          </GridCol>
        </GridRow>
      </Section >
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Strength' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.STRENGTH)}</Description>
        <GridRow>
          <GridCol col={{ span: 10 }} >
            <CertificateStrengthSettings />
          </GridCol>
        </GridRow>
      </Section >
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'CA Properties' })}</SettingsSectionTitle>
        <Description>{$t(caFormDescription.PROPERTIES)}</Description>
        <GridRow>
          <GridCol col={{ span: 10 }} >
            <OrganizationInfoSettings type={CertificateCategoryType.CERTIFICATE_AUTHORITY} />
          </GridCol>
        </GridRow>
      </Section >
    </>
  )
}
