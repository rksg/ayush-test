import { ReactNode, useEffect, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import {
  Form,
  Space,
  Typography,
  Upload
} from 'antd'
import TextArea    from 'antd/lib/input/TextArea'
import { useIntl } from 'react-intl'

import { Button, DrawerProps }             from '@acx-ui/components'
import { formatter }                       from '@acx-ui/formatter'
import {
  useAddTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {  TenantAuthentications, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { GuestErrorRes }                                    from '@acx-ui/user'

import * as UI from './styledComponents'

type ImportErrorRes = {
  errors: {
    code: number
    description?: string
    message?: string
  }[],
  downloadUrl?: string
  txId: string
} | GuestErrorRes

type AcceptableType = 'xml'

interface ImportFileDrawerProps extends DrawerProps {
  maxSize: number
  maxEntries?: number
  isLoading?: boolean
  importError?: FetchBaseQueryError
  importRequest?: (formData: FormData, values: object, content?: string)=>void
  readAsText?: boolean,
  formDataName?: string,
  acceptType: string[]
  extraDescription?: string[]
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  editData?: TenantAuthentications
}

const fileTypeMap: Record<AcceptableType, string[]>= {
  xml: ['text/xml']
}

export function SetupAzureDrawer (props: ImportFileDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const { maxSize, isLoading, importError, acceptType,
    formDataName = 'file', setVisible, isEditMode, editData } = props

  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const [formData, setFormData] = useState<FormData>()
  // const [file, setFile] = useState<Blob>()
  // const [fileName, setFileName] = useState<string>()

  const [uploadFile, setUploadFile] = useState(false)

  const bytesFormatter = formatter('bytesFormat')
  const [addSso] = useAddTenantAuthenticationsMutation()
  const [updateSso] = useUpdateTenantAuthenticationsMutation()

  useEffect(()=>{
    form.resetFields()
    setFormData(undefined)
    setFileDescription('')
    setUploadFile(isEditMode)
  }, [form, props.visible])

  useEffect(()=>{
    const importErrorData = (importError?.data ?? {}) as object
    if (Object.keys(importErrorData).length) {
      const errorObj = importError?.data as ImportErrorRes
      let errors, downloadUrl
      let description = ''

      if ('errors' in errorObj) {
        errors = errorObj.errors
        downloadUrl = errorObj.downloadUrl
        description = errors[0].description || errors[0].message!
      }
      if ('error' in errorObj) { // narrowing to GuestErrorRes
        errors = errorObj.error.rootCauseErrors
        description = errors[0].message
      }

      setFormData(undefined)
      setFileDescription(<>
        { errors && <Typography.Text type='danger'><WarningOutlined /> {$t(
          { defaultMessage: `{count, plural,
              one {{description}}
              other {{count} errors found.}
          }` },
          { count: errors.length, description }
        )}</Typography.Text>}
        { downloadUrl && <Typography.Link href={downloadUrl}
          onClick={(e)=>{
            e.stopPropagation()
          }}>
          {$t({ defaultMessage: 'See errors' })}
        </Typography.Link>}
      </>)
    }
  }, [$t, importError])

  const beforeUpload = (file: File) => {
    let errorMsg = ''
    const acceptableFileType = acceptType.map(type =>
      fileTypeMap[type as AcceptableType]).flat()

    if (!acceptableFileType?.includes(file.type)) {
      errorMsg = $t({ defaultMessage: 'Invalid file type.' })
    }
    if (file.size > maxSize) {
      errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
        fileSize: bytesFormatter(file.size)
      })
    }

    if (errorMsg) {
      setFormData(undefined)
      setFileDescription(
        <Typography.Text type='danger'>
          <WarningOutlined /> {errorMsg}
        </Typography.Text>
      )
      return Upload.LIST_IGNORE
    }

    const newFormData = new FormData()
    newFormData.append(formDataName, file, file.name)

    // setFile(file)
    // setFileName(file.name)
    setFormData(newFormData)
    setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)

    return false
  }

  const okHandler = async () => {
    try {
      const ssoData: TenantAuthentications = {
        name: 'saml_user',
        authenticationType: TenantAuthenticationType.saml,
        samlFileURL: 'my.xml'
      }

      const ssoEditData: TenantAuthentications = {
        name: 'saml_user',
        authenticationType: TenantAuthenticationType.saml,
        samlFileURL: 'myedit.xml'
      }

      if(isEditMode) {
        const result =
        await updateSso({ params: { authenticationId: editData?.id },
          payload: ssoEditData }).unwrap()
        if (result) {
        }
      } else {
        const result =
        await addSso({ payload: ssoData }).unwrap()
        if (result) {
        }
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }

    setVisible(false)
  }

  return (<UI.ImportFileDrawer {...props}
    keyboard={false}
    closable={true}
    width={550}
    // footer={footer}
    footer={<div>
      <Button
        disabled={!formData}
        loading={isLoading}
        onClick={() => okHandler()}
        type={'secondary'}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
      <Button onClick={() => {
        setVisible(false)
        // props?.onClose
      }}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>} >
    <label>
      { $t({ defaultMessage: 'IdP Metadata' }) }
    </label>
    {!uploadFile && <Button
      type='link'
      key='pasteIdp'
      onClick={() => { setUploadFile(true) }}>
      {$t({ defaultMessage: 'Upload file instead' })}
    </Button>}
    {!uploadFile && <TextArea
      placeholder='Paste IDP metadata here...'
      style={{
        fontSize: '12px',
        resize: 'none',
        marginTop: '15px',
        height: '661px',
        borderRadius: '4px'
      }}
      autoSize={false}
      readOnly={false}
    />}

    {uploadFile && <Upload.Dragger
      accept={acceptType?.map(type => `.${String(type)}`).join(', ')}
      maxCount={1}
      showUploadList={false}
      beforeUpload={beforeUpload} >
      <Space style={{ height: '90px' }}>
        { fileDescription ? fileDescription :
          <Typography.Text>
            {$t({ defaultMessage: 'Drag & drop file here or' })}
          </Typography.Text> }
        <Button type='primary'>{ fileDescription ?
          $t({ defaultMessage: 'Change File' }) :
          $t({ defaultMessage: 'Browse' }) }
        </Button>
      </Space>
    </Upload.Dragger>}
    {uploadFile && <Button type='link'
      key='uploadIdp'
      onClick={() => { setUploadFile(false) }}>
      {$t({ defaultMessage: 'Paste IdP Metadata code instead' })}
    </Button>}
    <Form layout='vertical' form={form} >
      {props.children}
    </Form>

  </UI.ImportFileDrawer>)
}

