import { ReactNode, useEffect, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import {
  Form,
  Space,
  Typography,
  Upload,
  UploadFile
} from 'antd'
import TextArea      from 'antd/lib/input/TextArea'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, DrawerProps }             from '@acx-ui/components'
import { formatter }                       from '@acx-ui/formatter'
import {
  useAddTenantAuthenticationsMutation,
  useGetUploadURLMutation,
  useUpdateTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {
  TenantAuthentications,
  TenantAuthenticationType,
  SamlFileType,
  UploadUrlResponse
} from '@acx-ui/rc/utils'

import { reloadAuthTable } from '../AppTokenFormItem'

import * as UI from './styledComponents'

type AcceptableType = 'xml'

interface ImportFileDrawerProps extends DrawerProps {
  maxSize: number
  maxEntries?:number
  isLoading?: boolean
  importRequest?: (formData: FormData, values: object, content?: string)=>void
  readAsText?: boolean,
  formDataName?: string,
  acceptType: string[]
  extraDescription?: string[]
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  setEditMode: (editMode: boolean) => void
  editData?: TenantAuthentications
}

const fileTypeMap: Record<AcceptableType, string[]>= {
  xml: ['text/xml']
}

// eslint-disable-next-line max-len
const regexUrl = new RegExp (/^(http|https):\/\/[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])+(:[1-9][0-9]{1,4})?((\/?)|(\/([a-zA-Z0-9~_.-]|(%[0-9]{2}))*)*)((\?|#).*)?$/)

export const getFileExtension = function (fileName: string) {
  // eslint-disable-next-line max-len
  const extensionsRegex: RegExp = /(xml)$/i
  const matched = extensionsRegex.exec(fileName)
  if (matched) {
    return matched[0]
  } else {
    return ''
  }
}

export function SetupAzureDrawer (props: ImportFileDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const params = useParams()

  const { maxSize, isLoading, acceptType,
    formDataName = 'file', setVisible, setEditMode, isEditMode, editData } = props

  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const [formData, setFormData] = useState<FormData>()
  const [file, setFile] = useState<UploadFile>()
  const [metadata, setMetadata] = useState<string>()

  const [uploadFile, setUploadFile] = useState(false)

  const bytesFormatter = formatter('bytesFormat')
  const [addSso] = useAddTenantAuthenticationsMutation()
  const [updateSso] = useUpdateTenantAuthenticationsMutation()
  const [getUploadURL] = useGetUploadURLMutation()

  useEffect(()=>{
    form.resetFields()
    setFormData(undefined)
    setFileDescription('')
    setUploadFile(isEditMode)
    if (isEditMode) {
      const editFile = {
        uid: editData?.samlFileURL,
        name: editData?.name,
        fileName: editData?.name
      } as UploadFile
      setFile(editFile)
      setFileDescription(<Typography.Text><FileTextOutlined /> {editData?.name} </Typography.Text>)
      // TODO: setMetadata() to contents of file only if we want to see file contents in metadata in editmode
      // fetchMetaData()
    }
  }, [form, props.visible])

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

    const newFile = file as unknown as UploadFile
    newFile.url = URL.createObjectURL(file)
    setFile(newFile)
    // setFileName(file.name)
    setFormData(newFormData)
    setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)

    return false
  }

  const onMetadataChange = (value: string) => {
    setMetadata(value)
    const newFormData = new FormData()
    // TODO: validate xml format
    newFormData.append('metadata', value)
    setFormData(newFormData)
  }

  const getFileUploadURL = async function (file: UploadFile) {
    const extension: string = getFileExtension(file.name)
    const uploadUrl = await getUploadURL({
      params: { ...params },
      payload: { fileExtension: extension }
    }) as { data: UploadUrlResponse }

    if (uploadUrl && uploadUrl.data && uploadUrl.data.fileId) {
      return await fetch(uploadUrl.data.signedUrl,
        { method: 'put', body: file as unknown as File, headers: {
          'Content-Type': ''
        } }).then(() => {
        return {
          fileName: file.name,
          fileId: file.uid,
          data: uploadUrl.data
        }
      })
    }
    else return undefined
  }

  const okHandler = async () => {
    try {
      let fileURL
      let fileType = SamlFileType.file
      let directUrlPath = ''
      const metadataFile = new Blob([metadata ?? ''], { type: 'text/xml' }) as unknown as UploadFile
      metadataFile.name = 'mysaml.xml'

      if (metadata && regexUrl.test(metadata)) {
        directUrlPath = metadata
        fileType = SamlFileType.direct_url
      } else {
        fileURL = uploadFile && file ? await getFileUploadURL(file)
          : !uploadFile ? await getFileUploadURL(metadataFile)
            : undefined
        if (!fileURL) {
          throw 'Error uploading file'
        }
      }

      if(isEditMode) {
        const ssoEditData: TenantAuthentications = {
          name: metadataFile.name,
          authenticationType: TenantAuthenticationType.saml,
          samlFileType: fileType,
          samlFileURL: fileType === SamlFileType.file ? fileURL?.data.fileId : directUrlPath
        }
        await updateSso({ params: { authenticationId: editData?.id },
          payload: ssoEditData }).unwrap()
        reloadAuthTable(2)
      } else {
        const ssoData: TenantAuthentications = {
          name: metadataFile.name,
          authenticationType: TenantAuthenticationType.saml,
          samlFileType: fileType,
          samlFileURL: fileType === SamlFileType.file ? fileURL?.data.fileId : directUrlPath
        }
        await addSso({ payload: ssoData }).unwrap()
        reloadAuthTable(2)
      }
      setVisible(false)
      setEditMode(true)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      setVisible(false)
    }
  }

  return (<UI.ImportFileDrawer {...props}
    keyboard={false}
    closable={true}
    width={550}
    footer={<div>
      <Button
        disabled={!formData}
        loading={isLoading}
        onClick={() => okHandler()}
        type={'primary'}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
      <Button onClick={() => {
        setVisible(false)
      }}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>} >
    <label>
      { $t({ defaultMessage: 'IdP Metadata' }) }
    </label>
    {!uploadFile && <Button
      style={{ alignSelf: 'end' }}
      type='link'
      key='pasteIdp'
      onClick={() => { setUploadFile(true) }}>
      {$t({ defaultMessage: 'Upload file instead' })}
    </Button>}
    {!uploadFile && <Form.Item>
      <TextArea
        value={metadata}
        onChange={e => onMetadataChange(e.target.value)}
        placeholder='Paste the IDP metadata code or link here...'
        style={{
          fontSize: '12px',
          resize: 'none',
          marginTop: '15px',
          height: '661px',
          borderRadius: '4px'
        }}
        autoSize={false}
        readOnly={false}
      />
    </Form.Item>}

    {uploadFile && <Upload.Dragger
      accept={acceptType?.map(type => `.${String(type)}`).join(', ')}
      maxCount={1}
      showUploadList={false}
      defaultFileList={file ? [file] : []}
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
      {$t({ defaultMessage: 'Paste IdP Metadata code or link instead' })}
    </Button>}
    <Form layout='vertical' form={form} >
      {props.children}
    </Form>

  </UI.ImportFileDrawer>)
}

