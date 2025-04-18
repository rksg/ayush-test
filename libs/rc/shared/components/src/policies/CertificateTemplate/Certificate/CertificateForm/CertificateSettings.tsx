import { useEffect, useState } from 'react'

import { Col, Divider, Form, Input, Row, Select } from 'antd'
import { useIntl }                                from 'react-intl'

import {
  useGetCertificateAuthoritiesQuery,
  useGetCertificateTemplatesQuery
} from '@acx-ui/rc/services'
import { CertificateTemplate, Persona } from '@acx-ui/rc/utils'

import { IdentitySelector }                                   from '../../../../users'
import { MAX_CERTIFICATE_PER_TENANT }                         from '../../constants'
import { certificateDescription, onboardSettingsDescription } from '../../contentsMap'
import { Description }                                        from '../../styledComponents'


export default function CertificateSettings (
  // eslint-disable-next-line max-len
  { templateData, specificIdentity }: { templateData?: CertificateTemplate, specificIdentity?: string }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const csrType = Form.useWatch('csrType', form)
  const certificateTemplateId = Form.useWatch('certificateTemplateId', form)
  // eslint-disable-next-line max-len
  const [identityGroupId, setIdentityGroupId] = useState<string | undefined>(templateData?.identityGroupId)

  const [, setIdentityDrawerState] = useState({
    visible: false,
    data: {} as Persona | undefined
  })

  const { caList } = useGetCertificateAuthoritiesQuery(
    { payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT } },
    {
      skip: !!templateData,
      selectFromResult: ({ data }) =>
        ({
          caList: data?.data?.filter((item) => item.privateKeyBase64)
            .map((item) => item.id)
        })
    })

  const {
    isCertificateTemplateOptionsLoading, certificateTemplateOptions
  } = useGetCertificateTemplatesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT,
      sortField: 'name', sortOrder: 'ASC' }
  }, {
    skip: !!templateData || !caList,
    selectFromResult: ({ data, isLoading }) =>
      ({
        isCertificateTemplateOptionsLoading: isLoading,
        certificateTemplateOptions: data?.data?.filter((item) =>
          caList?.includes(item.onboard?.certificateAuthorityId!) && item.identityGroupId)
          .map((item) => ({ label: item.name, value: item.id, variables: item.variables,
            groupId: item.identityGroupId }))
      })
  })

  useEffect(() => {
    const groupId = certificateTemplateOptions?.find(
      (item) => item.value === certificateTemplateId)?.groupId
    if (groupId && groupId !== identityGroupId) {
      setIdentityGroupId(groupId)
    }
  }, [certificateTemplateId, certificateTemplateOptions, identityGroupId])

  const csrSourceOptions = [
    { label: $t({ defaultMessage: 'Auto-Generate CSR' }), value: 'generate' },
    { label: $t({ defaultMessage: 'Copy & Paste CSR' }), value: 'copy' }
  ]

  const renderVariableItems = (variables: string[] = []) => (
    variables?.map((item, idx) => (
      <Row key={idx}>
        <Col span={10}>
          <Form.Item name={item}
            label={item}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    ))
  )

  useEffect(() =>{
    form.setFieldValue('identityId', undefined)
    setIdentityDrawerState({ visible: false, data: undefined })
  }, [certificateTemplateId])

  return (
    <>
      {!templateData && <Row>
        <Col span={10}>
          <Form.Item
            name='certificateTemplateId'
            label={$t({ defaultMessage: 'Certificate Template' })}
            rules={[{
              required: !templateData
            }]}
          >
            <Select
              loading={isCertificateTemplateOptionsLoading}
              placeholder={$t({ defaultMessage: 'Select Certificate Template...' })}
              options={certificateTemplateOptions}
            />
          </Form.Item>
        </Col>
      </Row>}
      {!specificIdentity &&
        <Row align={'middle'} gutter={8}>
          <Col span={10}>
            <IdentitySelector identityGroupId={identityGroupId}/>
          </Col>
        </Row>
      }
      <Row>
        <Col span={10}>
          <Form.Item
            name='csrType'
            label={$t({ defaultMessage: 'CSR Source' })}
            initialValue='generate'
          >
            <Select
              placeholder={$t({ defaultMessage: 'Select CSR Source...' })}
              options={csrSourceOptions}
            />
          </Form.Item>
        </Col>
      </Row>
      {csrType === 'copy' &&
        <>
          <Description>{$t(onboardSettingsDescription.KEY_LENGTH)}</Description>
          <Row>
            <Col span={10}>
              <Form.Item
                name='csrString'
                label={$t({ defaultMessage: 'Certificate Signing Request' })}
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={5} />
              </Form.Item>
            </Col>
          </Row>
        </>
      }
      <Divider />
      <Description>{$t(certificateDescription.INFORMATION)}</Description>
      {templateData ? renderVariableItems(templateData.variables) :
        renderVariableItems(certificateTemplateOptions?.find(
          (item) => item.value === certificateTemplateId)?.variables)}
      <Row>
        <Col span={10}>
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            rules={[{ max: 255 }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
