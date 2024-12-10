import { ReactNode, useEffect, useRef, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import {
  Form,
  FormInstance,
  Input,
  Space,
  Switch,
  Typography,
  Upload,
  UploadFile
} from 'antd'
import TextArea      from 'antd/lib/input/TextArea'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, DrawerProps, PasswordInput }                     from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { formatter }                                              from '@acx-ui/formatter'
import { useGetMspUploadURLMutation }                             from '@acx-ui/msp/services'
import {
  useAddTenantAuthenticationsMutation,
  useGetServerCertificatesQuery,
  useUpdateTenantAuthenticationsMutation
} from '@acx-ui/rc/services'
import {
  TenantAuthentications,
  TenantAuthenticationType,
  SamlFileType,
  UploadUrlResponse,
  excludeSpaceRegExp,
  notAllDigitsRegExp
} from '@acx-ui/rc/utils'

import { reloadAuthTable } from '../AppTokenFormItem'

import AuthTypeSelector         from './authTypeSelector'
import  SelectServerCertificate from './SelectServerCertificate'
import * as UI                  from './styledComponents'

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
  isGroupBasedLoginEnabled?: boolean
  isGoogleWorkspaceEnabled?: boolean
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
    formDataName = 'file', setVisible, setEditMode,
    isEditMode, editData, isGroupBasedLoginEnabled, isGoogleWorkspaceEnabled } = props

  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const [formData, setFormData] = useState<FormData>()
  const [file, setFile] = useState<UploadFile>()
  const [metadata, setMetadata] = useState<string>()
  const [metadataChanged, setMetadataChanged] = useState(false)
  const [cursor, setCursor] = useState<number>()
  const [fileSelected, setFileSelected] = useState(false)

  const [uploadFile, setUploadFile] = useState(false)
  const [selectedAuth, setSelectedAuth] = useState('')
  const [ssoSignature, setSsoSignature] = useState(false)
  const [certificateId, setCertificateId] = useState('')
  const loginSsoSignatureEnabled = useIsSplitOn(Features.LOGIN_SSO_SIGNATURE_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isSsoEncryptionEnabled = useIsSplitOn(Features.SSO_SAML_ENCRYPTION)

  const bytesFormatter = formatter('bytesFormat')

  const { data: certificateList } = useGetServerCertificatesQuery({ payload:
    { pageSize: 20, page: 1 } }, { skip: !isSsoEncryptionEnabled })

  const [addSso] = useAddTenantAuthenticationsMutation()
  const [updateSso] = useUpdateTenantAuthenticationsMutation()
  const [getUploadURL] = useGetMspUploadURLMutation()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onChangeSsoSignature = (checked: boolean) => {
    setSsoSignature(checked)
  }

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
      form.setFieldValue('domains', editData?.domains?.toString())
      setSsoSignature(editData?.samlSignatureEnabled ?? false)
      setCertificateId(editData?.samlEncryptionCertificateId ?? '')
    }
    setSelectedAuth(editData?.authenticationType || TenantAuthenticationType.saml)
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
    setFileSelected(true)
    setFormData(newFormData)
    setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)

    return false
  }

  const onMetadataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetadataChanged(true)
    setMetadata(e.target.value)
    const newFormData = new FormData()
    // TODO: validate xml format
    newFormData.append('metadata', e.target.value)
    setFormData(newFormData)
    setCursor(e.target.selectionStart)
  }

  const getFileUploadURL = async function (file: UploadFile) {
    const extension: string = getFileExtension(file.name)
    const uploadUrl = await getUploadURL({
      params: { ...params },
      payload: { fileExtension: extension },
      enableRbac: isRbacEnabled
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
        fileURL = uploadFile && fileSelected && file ? await getFileUploadURL(file)
          : await getFileUploadURL(metadataFile)
        if (!fileURL) {
          throw 'Error uploading file'
        }
      }

      const allowedDomains =
        isGroupBasedLoginEnabled ? form.getFieldValue('domains')?.split(',') : undefined
      if(isEditMode) {
        const needAuthUpdate = (uploadFile && fileSelected) || (!uploadFile && metadataChanged)
        const ssoEditData: TenantAuthentications = {
          name: metadataFile.name,
          authenticationType: TenantAuthenticationType.saml,
          samlFileType: needAuthUpdate ? fileType : undefined,
          samlFileURL: needAuthUpdate
            ? (fileType === SamlFileType.file ? fileURL?.data.fileId : directUrlPath) : undefined,
          domains: allowedDomains,
          samlSignatureEnabled: loginSsoSignatureEnabled ? ssoSignature : undefined,
          samlEncryptionCertificateId: isSsoEncryptionEnabled ? certificateId : undefined
        }
        await updateSso({ params: { authenticationId: editData?.id },
          payload: ssoEditData }).unwrap()
        reloadAuthTable(2)
      } else {
        const ssoData: TenantAuthentications = {
          name: metadataFile.name,
          authenticationType: TenantAuthenticationType.saml,
          samlFileType: fileType,
          samlFileURL: fileType === SamlFileType.file ? fileURL?.data.fileId : directUrlPath,
          domains: allowedDomains,
          samlSignatureEnabled: loginSsoSignatureEnabled ? ssoSignature : undefined,
          samlEncryptionCertificateId: isSsoEncryptionEnabled ? certificateId : undefined
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

  const okHandlerGoogle = async () => {
    try {
      const allowedDomains =
        isGroupBasedLoginEnabled ? form.getFieldValue('domains')?.split(',') : undefined
      const clientId = form.getFieldValue('clientId')
      const secret = form.getFieldValue('secret')

      if(isEditMode) {
        const ssoEditData: TenantAuthentications = {
          name: 'googleWorkspace',
          authenticationType: TenantAuthenticationType.google_workspace,
          clientSecret: secret,
          domains: allowedDomains
        }
        await updateSso({ params: { authenticationId: editData?.id },
          payload: ssoEditData }).unwrap()
        reloadAuthTable(2)
      } else {
        const ssoData: TenantAuthentications = {
          name: 'googleWorkspace',
          authenticationType: TenantAuthenticationType.google_workspace,
          clientID: clientId,
          clientSecret: secret,
          domains: allowedDomains
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

  const domainsValidator = async (value: string) => {
    // eslint-disable-next-line max-len
    const re = new RegExp(/(^((22[0-3]|2[0-1][0-9]|1[0-9][0-9]|[1-9][0-9]|[1-9]?)\.)((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$)|(^(\b((?=[A-Za-z0-9-]{1,63}\.)(xn--)?[A-Za-z0-9]+(-[A-Za-z0-9]+)*\.)+[A-Za-z]{2,63}\b)$)/)
    const domains = value?.split(',')
    const isValid = domains?.every((domain) => {
      return re.test(domain.trim())
    })

    return isValid ? Promise.resolve() : Promise.reject(
      `${$t({ defaultMessage: 'Please enter domains separated by comma' })} `
    )
  }

  const ApplyButton = ({ form }: { form: FormInstance }) => {
    const [submittable, setSubmittable] = useState(false)

    const values = Form.useWatch([], form)

    useEffect(() => {
      form.validateFields().then(
        () => setSubmittable(true),
        () => setSubmittable(false)
      )
    }, [values])

    return (
      <Button
        disabled={!formData && !submittable}
        loading={isLoading}
        onClick={() =>
          selectedAuth === TenantAuthenticationType.saml ? okHandler() : okHandlerGoogle()}
        type={'primary'}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    )
  }

  const SamlContent = () => {
    const metadataReference = useRef<HTMLInputElement>(null)

    useEffect(() => {
      metadataReference.current?.focus()
    }, [metadata])

    return <> <Form style={{ marginTop: 10 }} layout='vertical' form={form}>
      {isGroupBasedLoginEnabled && <Form.Item
        name='domains'
        label={$t({ defaultMessage: 'Allowed Domains' })}
        rules={[
          { type: 'string', required: true },
          { validator: (_, value) => domainsValidator(value) }
        ]}
        children={
          <Input
            placeholder={$t({ defaultMessage: 'Enter domains separated by comma' })}
          />
        }
      />}
    </Form>

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
        ref={metadataReference}
        value={metadata}
        onChange={onMetadataChange}
        onFocus={(e) => {
          if(cursor) {
            e.currentTarget.setSelectionRange(cursor, cursor)
          }}
        }
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

    {loginSsoSignatureEnabled && <Form.Item style={{ marginTop: '20px' }}
      colon={false}
      label={$t({ defaultMessage: 'Require SAML requests to be signed' })}
      tooltip={$t({ defaultMessage:
        'If this option is enabled, a public certificate needs to be configured' })}
      name='samlRequestSigned'
      valuePropName='checked'
    >
      <Switch style={{ marginLeft: '70px' }}
        checkedChildren={$t({ defaultMessage: 'Yes' })}
        unCheckedChildren={$t({ defaultMessage: 'No' })}
        defaultChecked={ssoSignature}
        onChange={onChangeSsoSignature}
      />
    </Form.Item>
    }
    {isSsoEncryptionEnabled &&
      <SelectServerCertificate
        serverSertificates={certificateList?.data}
        setSelected={setCertificateId}
        selected={certificateId}
      />
    }
    </>
  }

  const GoogleContent = () => {
    return <Form style={{ marginTop: 10 }} layout='vertical' form={form} >
      <Form.Item
        name='domains'
        label={$t({ defaultMessage: 'Allowed Domains' })}
        rules={[
          { type: 'string', required: true },
          { validator: (_, value) => domainsValidator(value) }
        ]}
        children={
          <Input
            placeholder={$t({ defaultMessage: 'Enter domains separated by comma' })}
          />
        }
      />
      <Form.Item
        name='clientId'
        label={$t({ defaultMessage: 'Client ID' })}
        initialValue={editData?.clientID || ''}
        rules={[
          { required: true },
          { min: 2 },
          { max: 64 }
        ]}
        children={<Input />}
      />
      <Form.Item
        name='secret'
        label={$t({ defaultMessage: 'Client secret' })}
        initialValue={editData?.clientSecret || ''}
        rules={[
          { required: true },
          { validator: (_, value) =>
          {
            if(value.length !== 32) {
              return Promise.reject(
                `${$t({ defaultMessage: 'Secret must be 32 characters long' })} `
              )
            }
            return Promise.resolve()
          }
          },
          { validator: (_, value) => excludeSpaceRegExp(value) },
          { validator: (_, value) => notAllDigitsRegExp(value),
            message: $t({ defaultMessage:
            'Secret must include letters or special characters; numbers alone are not accepted.' })
          }
        ]}
        children={<PasswordInput />}
      />
    </Form>
  }

  return (<UI.ImportFileDrawer {...props}
    keyboard={false}
    closable={true}
    width={550}
    onClose={onClose}
    footer={<div>
      {isGroupBasedLoginEnabled ? <ApplyButton form={form}></ApplyButton>
        : <Button
          disabled={!formData}
          loading={isLoading}
          onClick={() => okHandler()}
          type={'primary'}
        >
          {$t({ defaultMessage: 'Apply' })}
        </Button>}
      <Button onClick={() => {
        setVisible(false)
      }}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>} >

    {isEditMode && <Form layout='vertical'>
      <Form.Item
        name='authType'
        label={$t({ defaultMessage: 'Auth Type' })}
        children={
          <label>
            {editData?.authenticationType === TenantAuthenticationType.saml
              ? $t({ defaultMessage: 'SAML' })
              : $t({ defaultMessage: 'Google Workspace' })}
          </label>
        }
      /></Form>}

    {isGroupBasedLoginEnabled && isGoogleWorkspaceEnabled && !isEditMode &&
    <AuthTypeSelector
      ssoConfigured={true}
      setSelected={setSelectedAuth}
    />}

    {selectedAuth === TenantAuthenticationType.google_workspace
      ? <GoogleContent /> : <SamlContent />}

  </UI.ImportFileDrawer>)
}

