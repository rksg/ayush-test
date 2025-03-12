import { ReactNode, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { Button, Form, Input, Space, Typography, Upload } from 'antd'
import { useIntl }                                        from 'react-intl'

import { GridRow, GridCol }         from '@acx-ui/components'
import { formatter }                from '@acx-ui/formatter'
import { CertificateUrls, KeyType } from '@acx-ui/rc/utils'
import { hasAllowedOperations }     from '@acx-ui/user'
import { getOpsApi }                from '@acx-ui/utils'

import { caFormDescription }           from '../../contentsMap'
import { Description, Section, Title } from '../../styledComponents'

interface UploadCaSettingsProps {
  showPublicKeyUpload?: boolean
}

export function UploadCaSettings (props: UploadCaSettingsProps) {
  const { showPublicKeyUpload = true } = props
  const { $t } = useIntl()
  const { Text } = Typography
  const form = Form.useFormInstance()
  const password = Form.useWatch('password', form)
  const [fileDescription, setFileDescription] = useState<{ [key in KeyType]?: ReactNode }>({})
  const bytesFormatter = formatter('bytesFormat')
  const maxSize: number = 1024 * 50
  const acceptableFileExtensions = ['cer', 'crt', 'chain', 'pem', 'p7b', 'p12', 'der', 'key']

  const beforeUpload = async (file: File, keyType: KeyType) => {
    try {
      let errorMsg = ''
      const extension: string = file?.name.split('.').pop() as string
      if (!acceptableFileExtensions.includes(extension)) {
        errorMsg = $t({ defaultMessage: 'Invalid file type.' })
      }
      if (file.size > maxSize) {
        errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
          fileSize: bytesFormatter(file.size)
        })
      }

      if (errorMsg) throw errorMsg
      setFileDescription(prevState => ({
        ...prevState, [keyType]: (<Text><FileTextOutlined /> {file.name} </Text>)
      }))
      return false
    } catch (err) {
      form.setFieldValue(keyType, null)
      setFileDescription(prevState => ({
        ...prevState, [keyType]: <Text type='danger'><WarningOutlined /> {err as string}</Text>
      }))
      return Upload.LIST_IGNORE
    }
  }

  return (
    <>
      {showPublicKeyUpload && <>
        <Title>{$t({ defaultMessage: 'Upload CA' })}</Title>
        <Section>
          <GridRow>
            <GridCol col={{ span: 16 }}>
              <Form.Item
                name={'publicKey'}
                label={$t({ defaultMessage: 'Public Key' })}
                required
                rules={[
                  {
                    required: showPublicKeyUpload,
                    message: $t({ defaultMessage: 'Please upload valid public key' })
                  }]}
                valuePropName='file'>
                <Upload.Dragger
                  data-testid='public-key-upload'
                  accept={acceptableFileExtensions.map(type => `.${String(type)}`).join(', ')}
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => beforeUpload(file, KeyType.PUBLIC)} >
                  <Space style={{ height: '90px' }}>
                    {fileDescription[KeyType.PUBLIC] ? fileDescription[KeyType.PUBLIC] :
                      <Typography.Text>
                        {$t({ defaultMessage: 'Drag & drop file here or' })}
                      </Typography.Text>}
                    <Button type='primary'>{fileDescription[KeyType.PUBLIC] ?
                      $t({ defaultMessage: 'Change File' }) :
                      $t({ defaultMessage: 'Browse' })}
                    </Button>
                  </Space>
                </Upload.Dragger>
              </Form.Item>
            </GridCol>
          </GridRow>
        </Section>
      </>}
      { hasAllowedOperations([getOpsApi(CertificateUrls.uploadCAPrivateKey)]) &&<>
        <GridRow style={{ marginBottom: '30px' }}>
          <GridCol col={{ span: 16 }}>
            <Form.Item
              name={'privateKey'}
              label={$t({ defaultMessage: 'Private Key' })}
              rules={[
                {
                  required: password || !showPublicKeyUpload,
                  message: $t({ defaultMessage: 'Please upload valid private key' })
                }]}
              valuePropName='file'>
              <Upload.Dragger
                data-testid='private-key-upload'
                accept={acceptableFileExtensions.map(type => `.${String(type)}`).join(', ')}
                maxCount={1}
                showUploadList={false}
                beforeUpload={(file) => beforeUpload(file, KeyType.PRIVATE)} >
                <Space style={{ height: '90px' }}>
                  {fileDescription[KeyType.PRIVATE] ? fileDescription[KeyType.PRIVATE] :
                    <Typography.Text>
                      {$t({ defaultMessage: 'Drag & drop file here or' })}
                    </Typography.Text>}
                  <Button type='primary'>{fileDescription[KeyType.PRIVATE] ?
                    $t({ defaultMessage: 'Change File' }) :
                    $t({ defaultMessage: 'Browse' })}
                  </Button>
                </Space>
              </Upload.Dragger>
            </Form.Item>
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol col={{ span: 16 }}>
            <Description>{$t(caFormDescription.PRIVATE_KEY)}</Description>
          </GridCol>
        </GridRow>
      </>
      }

      <Section>
        <GridRow>
          <GridCol col={{ span: 16 }}>
            <Form.Item
              name='password'
              label={$t({ defaultMessage: 'Private Key Password' })}>
              <Input.Password maxLength={255}
              />
            </Form.Item>
          </GridCol>
        </GridRow>
      </Section>
    </>
  )
}
