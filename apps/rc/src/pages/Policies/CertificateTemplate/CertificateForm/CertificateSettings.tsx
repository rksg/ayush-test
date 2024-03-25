import { Col, Divider, Form, Input, Row, Select } from 'antd'
import { useIntl }                                from 'react-intl'

import { MAX_CERTIFICATE_PER_TENANT }      from '@acx-ui/rc/components'
import { useGetCertificateTemplatesQuery } from '@acx-ui/rc/services'

import { certificateDescription } from '../contentsMap'
import { Description }            from '../styledComponents'

export default function CertificateSettings ({ specificTemplate = false }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const csrType = Form.useWatch('csrType', form)
  const {
    isCertificateTemplateOptionsLoading, certificateTemplateOptions
  } = useGetCertificateTemplatesQuery({
    payload: { page: '1', pageSize: MAX_CERTIFICATE_PER_TENANT }
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        isCertificateTemplateOptionsLoading: isLoading,
        certificateTemplateOptions: data?.data?.map((item) => ({
          label: item.name,
          value: item.id
        }))
      }
    }
  })

  const csrSourceOptions = [
    { label: $t({ defaultMessage: 'Auto-Generate CSR' }), value: 'generate' },
    { label: $t({ defaultMessage: 'Copy & Paste CSR' }), value: 'copy' }
  ]

  return (
    <>
      {!specificTemplate && <Row>
        <Col span={10}>
          <Form.Item
            name='certificateTemplateId'
            label={$t({ defaultMessage: 'Certificate Template' })}
            rules={[{
              required: !specificTemplate
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
      }
      <Divider />
      <Description>{$t(certificateDescription.INFORMATION)}</Description>
      <Row>
        <Col span={10}>
          <Form.Item
            name='userName'
            label={$t({ defaultMessage: 'Username' })}
            rules={[{
              required: true
            }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
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
