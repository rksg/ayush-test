import { Checkbox, Form, Input, Select, Space } from 'antd'
import moment                                   from 'moment'
import { useIntl }                              from 'react-intl'

import { DatePicker, GridCol, GridRow }                                                                          from '@acx-ui/components'
import { useGetCertificateAuthoritiesQuery, useGetServerCertificatesQuery }                                      from '@acx-ui/rc/services'
import { trailingNorLeadingSpaces, checkObjectNotExists, ExtendedKeyUsages, KeyUsages, CertificateCategoryType } from '@acx-ui/rc/utils'

import CertificateStrengthSettings                                     from '../../CertificateTemplateForm/CertificateTemplateSettings/CertificateStrengthSettings'
import { MAX_CERTIFICATE_PER_TENANT }                                  from '../../constants'
import { caFormDescription, ExtendedKeyUsagesLabels, KeyUsagesLabels } from '../../contentsMap'
import { SettingsSectionTitle, Description, Section }                  from '../../styledComponents'


type GenerateCertificateFormProps = {
  extendedKeyUsages?: ExtendedKeyUsages[]
}

export const GenerateCertificate = (props: GenerateCertificateFormProps) => {
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
  const { certificateNameList } = useGetServerCertificatesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT }
  }, {
    selectFromResult: ({ data }) => {
      return {
        certificateNameList: data?.data?.map((item) =>
          ({ label: item.name, value: item.id }))
      }
    }
  })

  const nameValidator = async (value: string) => {
    if (certificateNameList) {
      const list = certificateNameList.map(n => ({ name: n.label }))
      const entityName = $t({ defaultMessage: 'Certificate' })
      return checkObjectNotExists(list, { name: value }, entityName)
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
      <Section>
        <GridRow>
          <GridCol col={{ span: 10 }}>
            <Form.Item
              name={'caId'}
              label={$t({ defaultMessage: 'Select Certificate Authority' })}
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
      <Section>
        <SettingsSectionTitle>
          {$t({ defaultMessage: 'Certificate Attributes' })}
        </SettingsSectionTitle>
        <GridRow>
          <GridCol col={{ span: 10 }} >
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) },
                { validator: (_, value) => nameValidator(value),
                  message: $t({ defaultMessage: 'This Certificate Name is already exists' }) }
              ]}
              validateTrigger={'onBlur'}
              validateFirst
              children={<Input />}
            />
            <Form.Item
              name='organization'
              label={$t({ defaultMessage: 'Organization' })}
              rules={[
                { min: 2 },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='organizationUnit'
              label={$t({ defaultMessage: 'Organization Unit' })}
              rules={[
                { min: 2 },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='country'
              label={$t({ defaultMessage: 'Country' })}
              rules={[
                { min: 2 },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='state'
              label={$t({ defaultMessage: 'State / Province' })}
              rules={[
                { min: 2 },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='locality'
              label={$t({ defaultMessage: 'Locality' })}
              rules={[
                { min: 2 },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
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
        <SettingsSectionTitle>
          {$t({ defaultMessage: 'Certificate Strength' })}
        </SettingsSectionTitle>
        <Description>{$t(caFormDescription.STRENGTH)}</Description>
        <GridRow>
          <GridCol col={{ span: 10 }} >
            <CertificateStrengthSettings certType={CertificateCategoryType.SERVER_CERTIFICATES}/>
          </GridCol>
        </GridRow>
      </Section >
      <Section>
        <SettingsSectionTitle>{$t({ defaultMessage: 'Advanced' })}</SettingsSectionTitle>
        <GridRow>
          <GridCol col={{ span: 10 }} >
            <Form.Item
              name={'keyUsages'}
              label={$t({ defaultMessage: 'Key Usage' })}
              children={
                <Checkbox.Group>
                  <Space direction={'vertical'}>
                    <Checkbox
                      value={KeyUsages.DIGITAL_SIGNATURE}
                      key={KeyUsages.DIGITAL_SIGNATURE}
                      children={$t(KeyUsagesLabels[KeyUsages.DIGITAL_SIGNATURE])} />
                    <Checkbox
                      value={KeyUsages.KEY_ENCIPHERMENT}
                      key={KeyUsages.KEY_ENCIPHERMENT}
                      children={$t(KeyUsagesLabels[KeyUsages.KEY_ENCIPHERMENT])} />
                  </Space>
                </Checkbox.Group>
              }
            />
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol col={{ span: 10 }} >
            <Form.Item
              name={'extendedKeyUsages'}
              label={$t({ defaultMessage: 'Extended Key Usage' })}
              initialValue={props?.extendedKeyUsages}
              children={
                <Checkbox.Group>
                  <Space direction={'vertical'}>
                    <Checkbox
                      value={ExtendedKeyUsages.CLIENT_AUTH}
                      key={ExtendedKeyUsages.CLIENT_AUTH}
                      children={$t(ExtendedKeyUsagesLabels[ExtendedKeyUsages.CLIENT_AUTH])}
                      disabled={props?.extendedKeyUsages?.includes(ExtendedKeyUsages.CLIENT_AUTH)}
                    />
                    <Checkbox
                      value={ExtendedKeyUsages.SERVER_AUTH}
                      key={ExtendedKeyUsages.SERVER_AUTH}
                      children={$t(ExtendedKeyUsagesLabels[ExtendedKeyUsages.SERVER_AUTH])}
                      disabled={props?.extendedKeyUsages?.includes(ExtendedKeyUsages.SERVER_AUTH)}
                    />
                  </Space>
                </Checkbox.Group>
              }
            />
          </GridCol>
        </GridRow>
      </Section >
    </>
  )
}
