import { ReactNode, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { Button, Form, Input, Space, Typography, Upload } from 'antd'
import { useIntl }                                        from 'react-intl'

import { GridRow, GridCol }                                        from '@acx-ui/components'
import { formatter }                                               from '@acx-ui/formatter'
import { useGetServerCertificatesQuery }                           from '@acx-ui/rc/services'
import { checkObjectNotExists, KeyType, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'

import { serverClientCertSupportdFiles }              from '../../contentsMap'
import { Description, Section, SettingsSectionTitle } from '../../styledComponents'


export function UploadCertificate () {
  const { $t } = useIntl()
  const { Text } = Typography
  const form = Form.useFormInstance()
  const [fileDescription, setFileDescription] = useState<{ [key in KeyType]?: ReactNode }>({})
  const bytesFormatter = formatter('bytesFormat')
  const maxSize: number = 1024 * 10
  const acceptablePublicKeyFileExts = ['pem', 'p12', 'der', 'crt']
  const acceptablePrivateKeyFileExts = ['pem', 'key', 'crt']

  const beforeUpload = async (file: File, keyType: KeyType) => {
    try {
      let errorMsg = ''
      const extension: string = file?.name.split('.').pop() as string
      if ((keyType === KeyType.PUBLIC && !acceptablePublicKeyFileExts.includes(extension))
      || (keyType === KeyType.PRIVATE && !acceptablePrivateKeyFileExts.includes(extension))) {
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

  const { certificateNameList } = useGetServerCertificatesQuery({
    payload: { page: '1', pageSize: 10000 }
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

  return (
    <>
      <SettingsSectionTitle>{$t({ defaultMessage: 'Upload Certificate' })}</SettingsSectionTitle>
      <Section>
        <GridRow>
          <GridCol col={{ span: 10 }}>
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
              children={<Input style={{
                width: '300px'
              }}/>}
            />
          </GridCol>
          <GridCol col={{ span: 16 }}>
            <Form.Item
              name={'publicKey'}
              label={$t({ defaultMessage: 'Public Key' })}
              required
              rules={[
                {
                  required: true,
                  message: $t({ defaultMessage: 'Please upload valid public key' })
                }]}
              valuePropName='file'>
              <Upload.Dragger
                data-testid='public-key-upload'
                accept={acceptablePublicKeyFileExts.map(type => `.${String(type)}`).join(', ')}
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
        <GridRow>
          <GridCol col={{ span: 16 }}>
            <Description>{$t(serverClientCertSupportdFiles.publicKey)}</Description>
          </GridCol>
        </GridRow>
      </Section>
      <Section>
        <GridRow style={{ marginBottom: '0px' }}>
          <GridCol col={{ span: 16 }}>
            <Form.Item
              name={'privateKey'}
              label={$t({ defaultMessage: 'Private Key' })}
              valuePropName='file'>
              <Upload.Dragger
                data-testid='private-key-upload'
                accept={acceptablePrivateKeyFileExts.map(type => `.${String(type)}`).join(', ')}
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
            <Description>{$t(serverClientCertSupportdFiles.privateKey)}</Description>
          </GridCol>
        </GridRow>
      </Section>
      <Section>
        <GridRow>
          <GridCol col={{ span: 16 }}>
            <Form.Item
              name='password'
              label={$t({ defaultMessage: 'Private Key Password' })}>
              <Input.Password
                style={{
                  width: '300px'
                }}
                maxLength={255}
              />
            </Form.Item>
          </GridCol>
        </GridRow>
      </Section>
    </>
  )
}