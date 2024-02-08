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
  showToast,
  showActionModal,
  Tooltip
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import * as UI from './styledComponents'

interface ImportSSOFileDrawerProps extends DrawerProps {
  isEditMode: boolean
  setVisible: (visible: boolean) => void,
  samlFileName: string | undefined
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

const wrapFileName = (fileName: string | undefined) => fileName
  ? <Typography.Text ellipsis>
    <FileTextOutlined />
    {fileName}
  </Typography.Text>
  : null

export const ImportSSOFileDrawer = (props: ImportSSOFileDrawerProps) => {
  const { title, visible, setVisible, isEditMode, samlFileName } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [localFileName, setLocalFileName] = useState<string>()
  const [localFileContents, setLocalFileContents] = useState<string>()
  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const bytesFormatter = formatter('bytesFormat')
  const [updateTenantSettings] = useUpdateTenantSettingsMutation()

  useEffect(() => {
    setFileDescription(wrapFileName(samlFileName))
  }, [samlFileName, visible])

  const resetFields = () => {
    form.resetFields()
    setFileDescription('')
    setLocalFileContents('')
    setIsLoading(false)
  }

  const onClose = () => {
    setVisible(false)
    resetFields()
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
      setFileDescription(wrapFileName(file.name))
      setLocalFileName(file.name)
      return resolve(false)
    })
  }

  const setTenantSettings = async (payload: object, successMsg: string) => {
    await updateTenantSettings({
      sso: JSON.stringify(payload)
    })
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: successMsg
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

  const okHandler = async () => {
    setIsLoading(true)
    setTenantSettings(
      {
        type: 'saml2',
        metadata: localFileContents,
        fileName: localFileName
      },
      $t({ defaultMessage: 'SSO configured successfully' })
    )
  }

  const deleteHandler = async () => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Delete SSO Configuration' }),
      content: $t({
        defaultMessage: 'Users added via SSO will no longer be able to log in. Are you sure?' }),
      onOk: async () => await setTenantSettings(
        {},
        $t({ defaultMessage: 'SSO removed successfully' }))
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
    forceRender
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
            <>
              <label>
                {$t({ defaultMessage: 'IdP Metadata' })}
              </label>
              <Tooltip.Question
                placement='top'
                title={$t({
                  defaultMessage: 'SAML file size must not exceed {filesize}'
                }, { filesize: bytesFormatter(FiveMBSize) })} />
            </>
          }>
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
