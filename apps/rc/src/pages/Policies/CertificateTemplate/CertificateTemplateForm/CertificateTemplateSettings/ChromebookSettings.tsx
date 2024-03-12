import { ReactNode, useEffect, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { Col, Form, Select, Input, Upload, Space, Typography, Button, Row, Switch } from 'antd'
import { useIntl }                                                                  from 'react-intl'

import { formatter }                                           from '@acx-ui/formatter'
import { ChromebookCertRemovalType, ChromebookEnrollmentType } from '@acx-ui/rc/utils'

import { enrollmentTypeLabel, existingCertLabel } from '../../contentsMap'
import { SettingsSectionTitle }                   from '../../styledComponents'


export default function ChromebookSettings () {
  const { $t } = useIntl()
  const { Text } = Typography
  const form = Form.useFormInstance()
  const chromebookEnabled = Form.useWatch(['chromebook', 'enabled'])
  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const acceptableFileType = 'application/json'
  const bytesFormatter = formatter('bytesFormat')
  const maxSize = 1024 * 1024 * 10
  const beforeUpload = async (file: File) => {
    try {
      let errorMsg = ''
      const fileType: string = file?.type
      if (acceptableFileType !== fileType) {
        errorMsg = $t({ defaultMessage: 'Invalid file type.' })
      }
      if (file.size > maxSize) {
        errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
          fileSize: bytesFormatter(file.size)
        })
      }

      if (errorMsg) throw errorMsg

      const content = await readFileContent(file)
      validateFileContent(content)
      form.setFieldValue(['chromebook', 'accountCredential'], content)
      setFileDescription(() => ((<Text><FileTextOutlined /> {file.name} </Text>)))
      return false
    } catch (err) {
      form.setFieldValue(['chromebook', 'accountCredential'], null)
      setFileDescription((<Text type='danger'><WarningOutlined /> {err as string}</Text>))
      return Upload.LIST_IGNORE
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        try {
          const content = JSON.stringify(JSON.parse(String(fileReader.result)))
          resolve(content)
        } catch (error) {
          reject($t({ defaultMessage: 'Invalid file content.' }))
        }
      }

      fileReader.readAsText(file as Blob)
    })
  }

  const validateFileContent = (content: string) => {
    const jsonContent = JSON.parse(content)
    const requiredFields = ['type', 'project_id', 'client_email', 'private_key_id']
    const missingField = requiredFields.find(field => !(field in jsonContent))
    if (missingField) {
      throw $t({ defaultMessage: 'Missing column: {missingField}' }, { missingField })
    }
  }

  const validateFileReqired = () => {
    const accountCredential = form.getFieldValue(['chromebook', 'accountCredential'])
    if (!accountCredential) {
      return Promise.reject($t({ defaultMessage: 'Please upload the account credential' }))
    }
    return Promise.resolve()
  }

  useEffect(() => {
    try {
      const accountCredential = form.getFieldValue(['chromebook', 'accountCredential'])
      const jsonAccountCredential = JSON.parse(accountCredential)
      if (jsonAccountCredential.project_id) {
        setFileDescription(() =>
          ((<Text><FileTextOutlined /> {jsonAccountCredential.project_id}.json </Text>)))
      }
    } catch (error) { }
  }, [])

  return (
    <>
      <Row>
        <Col span={24}>
          <SettingsSectionTitle>
            {$t({ defaultMessage: 'Chromebook Enrollment' })}
          </SettingsSectionTitle>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item name={['chromebook', 'enabled']}
            label={$t({ defaultMessage: 'Enable Chromebook Enrollment' })}
            valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      {chromebookEnabled &&
        <>
          <Row>
            <Col span={10}>
              <Form.Item name={['chromebook', 'enrollmentType']}
                label={$t({ defaultMessage: 'Enrollment Type' })}
              >
                <Select
                  options={
                    Object.values(ChromebookEnrollmentType).map((value) =>
                      ({ value, label: $t(enrollmentTypeLabel[value]) }))}
                  placeholder={$t({ defaultMessage: 'Select Enrollment Type...' })} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Form.Item name={['chromebook', 'certRemovalType']}
                label={$t({ defaultMessage: 'Existing Certificates' })}
              >
                <Select
                  options={
                    Object.values(ChromebookCertRemovalType).map((value) =>
                      ({ value, label: $t(existingCertLabel[value]) }))}
                  placeholder={$t({ defaultMessage: 'Select Existing Certificates...' })} />
              </Form.Item >
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Form.Item name={['chromebook', 'notifyAppId']}
                label={$t({ defaultMessage: 'App ID To Notify' })}
              >
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Form.Item
                name={['chromebook', 'apiKey']}
                label={$t({ defaultMessage: 'Google API Key' })}
                rules={[{ required: true }]}
              >
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Form.Item
                name={['chromebook', 'accountCredentialFile']}
                label={$t({ defaultMessage: 'Service Account JSON Private Key' })}
                required
                rules={[{ validator: () => validateFileReqired() }]}
                valuePropName='file'>
                <Upload.Dragger
                  data-testid='credential'
                  accept={'.json'}
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => beforeUpload(file)}
                >
                  <Space style={{ height: '96px' }}>
                    {fileDescription ? fileDescription :
                      <Typography.Text>
                        {$t({ defaultMessage: 'Drag & drop file here or' })}
                      </Typography.Text>}
                    <Button type='primary'>{fileDescription ?
                      $t({ defaultMessage: 'Change File' }) :
                      $t({ defaultMessage: 'Browse' })}
                    </Button>
                  </Space>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>
        </>
      }
    </>
  )
}

