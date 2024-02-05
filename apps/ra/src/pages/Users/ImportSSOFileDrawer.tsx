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

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import {
  Loader,
  Button,
  DrawerProps,
  showToast
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import * as UI from './styledComponents'

interface ImportSSOFileDrawerProps extends DrawerProps {
  isEditMode: boolean
  setVisible: (visible: boolean) => void
}

const { Dragger } = Upload

const FiveMBSize = 1024 * 5 * 1024

const isValidXml = (rawXml: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(rawXml, 'text/xml')
  return doc.querySelector('parsererror') == null
}

const getFileExtension = (fileName: string) => {
  const extensionsRegex: RegExp = /(.xml)$/i
  const matched = extensionsRegex.exec(fileName)
  return matched && matched.length && matched[0]
}

export const ImportSSOFileDrawer = (props: ImportSSOFileDrawerProps) => {
  const { title, visible, setVisible, isEditMode } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [localFileContents, setLocalFileContents] = useState<string | undefined>()
  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const bytesFormatter = formatter('bytesFormat')
  const [updateTenantSettings] = useUpdateTenantSettingsMutation()
  const resetFields = () => {
    form.resetFields()
    setFileDescription('')
    setLocalFileContents('')
    setIsLoading(false)
  }

  useEffect(() => {
    resetFields()
  }, [form, props.visible])

  const onClose = () => {
    resetFields()
    setVisible(false)
  }

  const beforeUpload = (file: File) => {
    return new Promise<false | typeof Upload.LIST_IGNORE>(async (resolve) => {
      let errorMsg = ''
      /* istanbul ignore next */
      if (!getFileExtension(file.name)) {
        /* istanbul ignore next */
        errorMsg = $t({ defaultMessage: 'File has invalid extension name.' })
      }
      if (file.size > FiveMBSize) {
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
        return resolve(Upload.LIST_IGNORE)
      }
      setLocalFileContents(fileContents)
      setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)
      return resolve(false)
    })
  }

  const okHandler = async () => {
    setIsLoading(true)
    await updateTenantSettings({
      sso: JSON.stringify({
        type: 'saml2',
        metadata: localFileContents
      })
    })
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t(
            { defaultMessage: 'SAML file {action} successfully' },
            { action: isEditMode ? 'updated' : 'added' }
          )
        })
      })
      .catch(error => {
        showToast({
          type: 'error',
          content: $t(
            { defaultMessage: 'Error: {error}, please try again later' },
            { error: error.data })
        })
      })
      .finally(() => {
        resetFields()
        setVisible(false)
      })
  }

  const deleteHandler = async () => {
    setIsLoading(true)
    await updateTenantSettings({
      sso: JSON.stringify({})
    })
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'SAML file deleted successfully' })
        })
      })
      .catch(error => {
        showToast({
          type: 'error',
          content: $t(
            { defaultMessage: 'Error: {error}, please try again later' },
            { error: error.data })
        })
      })
      .finally(() => {
        resetFields()
        setVisible(false)
      })
  }

  const ApplyButton = () => {
    return (
      <Button
        disabled={!Boolean(localFileContents)}
        onClick={() => okHandler()}
        type='primary'>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    )
  }

  const DeleteButton = () => {
    return (
      <Button
        onClick={() => deleteHandler()}
        type='primary'>
        {$t({ defaultMessage: 'Delete' })}
      </Button>
    )
  }

  return <UI.ImportFileDrawer
    width={400}
    title={title}
    visible={visible}
    onClose={() => onClose()}
    destroyOnClose
    footer={<><div>
      <ApplyButton />
      <Button onClick={() => onClose()}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>
    {isEditMode && <DeleteButton />}</>}
  >
    <Loader states={[{ isLoading }]}>
      <Form layout='vertical' form={form}>
        <Form.Item
          id='uploadFile'
          htmlFor='uploadFile'
          label={
            <label>
              {$t({ defaultMessage: 'IdP Metadata' })}
            </label>}>
          <Dragger
            id='uploadFile'
            name='file'
            accept='.xml'
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
        </Form.Item>
      </Form>
    </Loader>
  </UI.ImportFileDrawer>
}
