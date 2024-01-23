import { ReactNode, useState, useEffect } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import {
  Form,
  Upload,
  Space,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  DrawerProps
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import * as UI from './styledcomponents'

interface ImportSSOFileDrawerProps extends DrawerProps {
  maxSize: number
  formDataName?: string
  setVisible: (visible: boolean) => void
}

const { Dragger } = Upload

const acceptType = ['xml']

const getFileExtension = function (fileName: string) {
  const extensionsRegex: RegExp = /(xml)$/i
  const matched = extensionsRegex.exec(fileName)
  if (matched) {
    return matched[0]
  } else {
    return ''
  }
}

const isValidXml = (rawXml: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(rawXml, 'text/xml')
  return !Boolean(doc.querySelector('parsererror'))
}

export const ImportSSOFileDrawer = (props: ImportSSOFileDrawerProps) => {
  const {
    title,
    visible,
    setVisible,
    maxSize
  } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [localFileContents, setLocalFileContents] = useState<string>()
  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const bytesFormatter = formatter('bytesFormat')

  useEffect(() => {
    form.resetFields()
    setFileDescription('')
    setLocalFileContents('')
  }, [form, props.visible])

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const beforeUpload = async (file: File) => {
    let errorMsg = ''
    if (!getFileExtension(file.name)) {
      errorMsg = $t({ defaultMessage: 'Invalid file type.' })
    }
    if (file.size > maxSize) {
      errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
        fileSize: bytesFormatter(file.size)
      })
    }

    const fileContents = await file.text()

    if (!isValidXml(fileContents)) {
      errorMsg = $t({ defaultMessage: 'File has invalid XML structure.' })
    }

    if (errorMsg) {
      setFileDescription(
        <Typography.Text type='danger'>
          <WarningOutlined /> {errorMsg}
        </Typography.Text>
      )
      return Promise.reject(Upload.LIST_IGNORE)
    }

    setLocalFileContents(fileContents)
    setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)
    return false
  }

  const okHandler = async () => {
    try {
      // TODO: link services to save SSO in tenantSettings
      setVisible(false)
    } catch (error) {
      setVisible(false)
    }
  }

  const ApplyButton = () => {
    return (
      <Button
        disabled={!Boolean(localFileContents)}
        onClick={() => okHandler()}
        type={'primary'} >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    )
  }

  return <UI.ImportFileDrawer
    title={title}
    visible={visible}
    onClose={() => onClose()}
    destroyOnClose
    footer={<div>
      <ApplyButton />
      <Button onClick={() => {
        setVisible(false)
      }}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>}
  >
    <Form layout='vertical' form={form}>
      <label>
        {$t({ defaultMessage: 'IdP Metadata' })}
      </label>
      <UI.Spacer />
      <Dragger
        name='file'
        accept={acceptType.map(type => `.${type}`).join(', ')}
        maxCount={1}
        showUploadList={false}
        beforeUpload={beforeUpload}>
        <Space>
          {fileDescription
            ? fileDescription
            : $t({ defaultMessage: 'Drag & Drop file here or' })}
          <Button type='primary'>{fileDescription
            ? $t({ defaultMessage: 'Change File' })
            : $t({ defaultMessage: 'Browse' })}
          </Button>
        </Space>
      </Dragger>
    </Form>
  </UI.ImportFileDrawer>
}
