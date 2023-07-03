import { useState, useEffect } from 'react'

import { QuestionCircleOutlined } from '@ant-design/icons'
import {
  Divider,
  Form,
  Input,
  Select,
  Radio,
  RadioChangeEvent,
  Space,
  UploadFile,
  Tooltip,
  Card
} from 'antd'
import { Button, Upload, InputNumber, Switch } from 'antd'
import { useIntl }                             from 'react-intl'

import {
  PageHeader,
  showActionModal,
  showToast,
  StepsForm,
  Subtitle,
  Fieldset,
  GridCol,
  GridRow
} from '@acx-ui/components'
import {
  useAddMspLabelMutation,
  useGetMspBaseURLQuery,
  useGetMspLabelQuery,
  useUpdateMspLabelMutation
} from '@acx-ui/msp/services'
import {
  MspPortal,
  MspLogoFile
} from '@acx-ui/msp/utils'
import { PhoneInput }       from '@acx-ui/rc/components'
import {
  useExternalProvidersQuery,
  useGetUploadURLMutation
} from '@acx-ui/rc/services'
import {
  emailRegExp,
  phoneRegExp,
  Providers,
  UploadUrlResponse,
  networkWifiIpRegExp,
  networkWifiSecretRegExp
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { loadImageWithJWT } from '@acx-ui/utils'

import defaultLoginLogo   from '../images/comscope-logo-ping.png'
import defaultAlarmLogo   from '../images/ruckus-logo-alarm.png'
import defaultPortalLogo  from '../images/ruckus-logo-cloud.png'
import defaultSupportLogo from '../images/ruckus-logo-notification.png'
import supportLinkImg     from '../images/supportlink.png'
import * as UI            from '../styledComponents'

export const getFileExtension = function (fileName: string) {
  // eslint-disable-next-line max-len
  const extensionsRegex: RegExp = /(png|jpg|gif)$/i
  const matched = extensionsRegex.exec(fileName)
  if (matched) {
    return matched[0]
  } else {
    return ''
  }
}

export function PortalSettings () {
  const intl = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const params = useParams()

  const linkDashboard = useTenantLink('/dashboard', 'v')

  const [selectedLogo, setSelectedLogo] = useState('defaultLogo')
  const [defaultFileList, setDefaultFileList] = useState<UploadFile[]>([])
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [portalLogoUrl, setPortalLogoUrl] = useState('')
  const [loginLogoUrl, setLoginLogoUrl] = useState('')
  const [supportLogoUrl, setSupportLogoUrl] = useState('')
  const [alarmLogoUrl, setAlarmLogoUrl] = useState('')
  const [getUploadURL] = useGetUploadURLMutation()

  const [preferredProvider, setPreferredProvider] = useState<string>('')
  const [customProfileName, setCustomProfileName] = useState<string>('')
  const [isOtherProvider, setOtherProvider] = useState(false)
  const [accountServerEnabled, setAccountServer] = useState(false)
  const [changeNeeded, setChangeNeeded] = useState(true)

  const [showContactSupport, setContactSupport] = useState(false)
  const [showOpenCase, setOpenCase] = useState(true)
  const [showMyCase, setMyCase] = useState(true)

  const [isEditMode, setEditMode] = useState(false)

  const [externalProviders, setExternalProviders]=useState<Providers[]>()
  const [baseDomainUrl, setBaseDomainUrl] = useState('')

  const [addMspLabel] = useAddMspLabelMutation()
  const [updateMspLabel] = useUpdateMspLabelMutation()

  const { data: provider } = useExternalProvidersQuery({ params })
  const { data: baseUrl } = useGetMspBaseURLQuery({ params })
  const { data: mspLabel } = useGetMspLabelQuery({ params })

  useEffect(() => {
    const fetchImages = async (mspLabel: MspPortal) => {
      const defaultList = await Promise.all(mspLabel.mspLogoFileDataList?.map((file) => {
        return loadImageWithJWT(file.logo_fileuuid)
          .then((fileUrl) => {
            return {
              uid: file.logo_fileuuid,
              name: file.logo_file_name,
              fileName: file.logo_file_name,
              url: fileUrl,
              status: 'done'
            }
          })
      }) as unknown as UploadFile[])
      setDefaultFileList(defaultList)
      setFileList(defaultList)
      setSelectedLogo('myLogo')
      mspLabel.logo_uuid
        ? setPortalLogoUrl(await loadImageWithJWT(mspLabel.logo_uuid))
        : setPortalLogoUrl(defaultPortalLogo)
      mspLabel.ping_login_logo_uuid
        ? setLoginLogoUrl(await loadImageWithJWT(mspLabel.ping_login_logo_uuid))
        : setLoginLogoUrl(defaultLoginLogo)
      mspLabel.ping_notification_logo_uuid
        ? setSupportLogoUrl(await loadImageWithJWT(mspLabel.ping_notification_logo_uuid))
        : setSupportLogoUrl(defaultSupportLogo)
      mspLabel.alarm_notification_logo_uuid
        ? setAlarmLogoUrl(await loadImageWithJWT(mspLabel.alarm_notification_logo_uuid))
        : setAlarmLogoUrl(defaultAlarmLogo)
    }
    if (provider) {
      const providers = provider.providers
      setExternalProviders(providers)
    }
    if (mspLabel?.msp_label) {
      setEditMode(true)
      mspLabel?.contact_support_behavior === 'hide'
        ? setContactSupport(false) : setContactSupport(true)
      mspLabel?.open_case_behavior === 'hide'
        ? setOpenCase(false) : setOpenCase(true)
      mspLabel?.my_open_case_behavior === 'hide'
        ? setMyCase(false) : setMyCase(true)
      if (mspLabel.mspLogoFileDataList && mspLabel.mspLogoFileDataList.length > 0) {
        fetchImages(mspLabel)
      }
      else {
        setPortalLogoUrl(defaultPortalLogo)
        setLoginLogoUrl(defaultLoginLogo)
        setSupportLogoUrl(defaultSupportLogo)
        setAlarmLogoUrl(defaultAlarmLogo)
      }
      if (mspLabel.preferredWisprProvider && mspLabel.preferredWisprProvider.providerName) {
        if (mspLabel.preferredWisprProvider.customExternalProvider) {
          setPreferredProvider('Other provider')
          setCustomProfileName(mspLabel.preferredWisprProvider.providerName)
          setOtherProvider(true)
          if (mspLabel.preferredWisprProvider.acct) {
            setAccountServer(true)
          }
        } else {
          setPreferredProvider(mspLabel.preferredWisprProvider.providerName)
        }
      }
    }
    if (baseUrl?.base_url) {
      setBaseDomainUrl(`.${baseUrl.base_url}`)
    }
  }, [provider, mspLabel])

  function mspLabelRegExp (value: string) {
    const re = new RegExp (/^[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]$/)

    if (value && !re.test(value)) {
      return Promise.reject(intl.$t({ defaultMessage: 'Please enter a valid domain name' }))
    }
    return Promise.resolve()
  }
  function urlRegExp (value: string) {
  // eslint-disable-next-line max-len
    const re = new RegExp (/^(http|https):\/\/[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])+(:[1-9][0-9]{1,4})?((\/?)|(\/([a-zA-Z0-9~_.-]|(%[0-9]{2}))*)*)((\?|#).*)?$/)

    if (value && !re.test(value)) {
      return Promise.reject(intl.$t({ defaultMessage: 'Please enter a valid URL' }))
    }
    return Promise.resolve()
  }

  const beforeUpload = function (file: File) {
    const acceptedImageTypes = ['image/png', 'image/jpg', 'image/gif']
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = intl.$t({ defaultMessage: 'Invalid image type!' })
      showToast({
        type: 'error',
        content
      })
      return
    }
    const isLt750K = file.size / 1024 < 750
    if (!isLt750K) {
      const content = intl.$t({ defaultMessage: 'Image must be smaller than 750KB!' })
      showToast({
        type: 'error',
        content
      })
      return
    }
    if (fileList.find(f => f.name === file.name)) {
      const content = intl.$t({ defaultMessage: 'An image already exists with that filename!' })
      showToast({
        type: 'error',
        content
      })
      return
    }
    const newFile = file as unknown as UploadFile
    newFile.url = URL.createObjectURL(file)
    // If this is the only image imported, load image into all logo previews
    if (!fileList.length) {
      form.setFieldValue('logo_uuid', newFile.uid)
      form.setFieldValue('ping_login_logo_uuid', newFile.uid)
      form.setFieldValue('ping_notification_logo_uuid', newFile.uid)
      form.setFieldValue('alarm_notification_logo_uuid', newFile.uid)
      setPortalLogoUrl(newFile.url?? '')
      setLoginLogoUrl(newFile.url?? '')
      setSupportLogoUrl(newFile.url?? '')
      setAlarmLogoUrl(newFile.url?? '')
    }
    const newFileList = [ ...fileList, newFile ]
    setFileList(newFileList)
    return false
  }

  const onRemove = function (file : UploadFile) {
    const newFileList = fileList.filter(f => f.uid !== file.uid)
    setFileList(newFileList)
    // Remove image from logo previews
    if (form.getFieldValue('logo_uuid') === file.uid) {
      form.setFieldValue('logo_uuid', undefined)
      setPortalLogoUrl('')
    }
    if (form.getFieldValue('ping_login_logo_uuid') === file.uid) {
      form.setFieldValue('ping_login_logo_uuid', undefined)
      setLoginLogoUrl('')
    }
    if (form.getFieldValue('ping_notification_logo_uuid') === file.uid) {
      form.setFieldValue('ping_notification_logo_uuid', undefined)
      setSupportLogoUrl('')
    }
    if (form.getFieldValue('alarm_notification_logo_uuid') === file.uid) {
      form.setFieldValue('alarm_notification_logo_uuid', undefined)
      setAlarmLogoUrl('')
    }
  }

  const getFilesUploadURL = async function (files : UploadFile[]) {
    return await Promise.all(files.map((file) => {
      const extension: string = getFileExtension(file.name)
      return getUploadURL({
        params: { ...params },
        payload: { fileExtension: extension }
      }).unwrap().then((uploadUrl) => {
        fetch(uploadUrl.signedUrl, { method: 'put', body: file as unknown as File, headers: {
          'Content-Type': ''
        } })
        return {
          fileName: file.name,
          fileId: file.uid,
          data: uploadUrl
        }
      })
    }))
  }

  const updateFormFileIds = function (values: MspPortal,
    uploadUrls: { fileName: string, fileId: string, data: UploadUrlResponse }[]) {
    if (values.logo_uuid) {
      const file = uploadUrls.find(f => f.fileId === values.logo_uuid)
      if (file) {
        values.logo_uuid = file.data.fileId
      }
    }
    if (values.ping_login_logo_uuid) {
      const file = uploadUrls.find(f => f.fileId === values.ping_login_logo_uuid)
      if (file) {
        values.ping_login_logo_uuid = file.data.fileId
      }
    }
    if (values.ping_notification_logo_uuid) {
      const file = uploadUrls.find(f => f.fileId === values.ping_notification_logo_uuid)
      if (file) {
        values.ping_notification_logo_uuid = file.data.fileId
      }
    }
    if (values.alarm_notification_logo_uuid) {
      const file = uploadUrls.find(f => f.fileId === values.alarm_notification_logo_uuid)
      if (file) {
        values.alarm_notification_logo_uuid = file.data.fileId
      }
    }
    return values
  }

  const getMspPortalToSave = async (values: MspPortal) => {
    const portal: MspPortal = {}
    if (selectedLogo === 'defaultLogo') {
      const formData = { ...mspLabel, ...values }

      portal.msp_label = formData.msp_label
      portal.contact_support_url = showContactSupport ? formData.contact_support_url : ''
      portal.open_case_url = showOpenCase ? formData.open_case_url : ''
      portal.my_open_case_url = showMyCase ? formData.my_open_case_url : ''
      portal.msp_phone = formData.msp_phone
      portal.msp_email = formData.msp_email
      portal.msp_website = formData.msp_website
    }
    else {
      const uploadedFiles = fileList.filter(file => file.status === 'done')
      const uploadedFileDataList: MspLogoFile[] = uploadedFiles.map((file) => {
        return {
          logo_fileuuid: file.uid,
          logo_file_name: file.name
        }
      })
      const newFiles = fileList.filter(file => file.status !== 'done')
      const uploadUrls = await getFilesUploadURL(newFiles)
      const newFileList = uploadUrls ? uploadUrls.map((uploadUrl) => {
        const logoFileData: MspLogoFile = {
          logo_fileuuid: uploadUrl.data.fileId,
          logo_file_name: uploadUrl.fileName
        }
        return logoFileData
      }) : []
      const logoFileDataList = uploadedFileDataList.concat(newFileList)
      values = uploadUrls ? updateFormFileIds({ ...values }, uploadUrls) : values
      const formData = { ...mspLabel, ...values }

      portal.msp_label = formData.msp_label
      portal.logo_uuid = formData.logo_uuid
      portal.alarm_notification_logo_uuid = formData.alarm_notification_logo_uuid
      portal.ping_notification_logo_uuid = formData.ping_notification_logo_uuid
      portal.ping_login_logo_uuid = formData.ping_login_logo_uuid
      portal.mspLogoFileDataList = logoFileDataList
      portal.contact_support_url = showContactSupport ? formData.contact_support_url : ''
      portal.open_case_url = showOpenCase ? formData.open_case_url : ''
      portal.my_open_case_url = showMyCase ? formData.my_open_case_url : ''
      portal.msp_phone = formData.msp_phone
      portal.msp_email = formData.msp_email
      portal.msp_website = formData.msp_website
    }
    if (!showContactSupport) {
      portal.contact_support_behavior = 'hide'
    }
    if (!showOpenCase) {
      portal.open_case_behavior = 'hide'
    }
    if (!showMyCase) {
      portal.my_open_case_behavior = 'hide'
    }
    if (preferredProvider) {
      if (isOtherProvider) {
        portal.preferredWisprProvider = {
          providerName: values.preferredWisprProvider?.providerName as string,
          apiKey: '',
          apiSecret: '',
          customExternalProvider: true,
          auth: values.preferredWisprProvider?.auth,
          acct: values.preferredWisprProvider?.acct
        }
      } else {
        portal.preferredWisprProvider = {
          providerName: preferredProvider,
          apiKey: '',
          apiSecret: '',
          customExternalProvider: false
        }
      }
    }
    return portal
  }

  const handleAddMspLabel = async (values: MspPortal) => {
    try {
      const formData = await getMspPortalToSave(values)
      await addMspLabel({ params, payload: formData }).unwrap()
      navigate(linkDashboard, { replace: true })
      window.location.reload()
    } catch(error) {
      const respData = error as { status: number, data: { [key: string]: string } }
      showActionModal({
        type: 'error',
        title: intl.$t({ defaultMessage: 'Onboard MSP Failed' }),
        // eslint-disable-next-line max-len
        content: intl.$t({ defaultMessage: 'An error occurred: {error}' }, { error: respData.data.message })
      })
    }
  }

  const handleUpdateMspLabel = async (values: MspPortal) => {
    try {
      const portal: MspPortal = await getMspPortalToSave(values)
      await updateMspLabel({ params, payload: portal }).unwrap()
      navigate(linkDashboard, { replace: true })
    } catch(error) {
      const respData = error as { status: number, data: { [key: string]: string } }
      showActionModal({
        type: 'error',
        title: intl.$t({ defaultMessage: 'Update Portal Setting Failed' }),
        // eslint-disable-next-line max-len
        content: intl.$t({ defaultMessage: 'An error occurred: {error}' }, { error: respData.data.message })
      })
    }
  }

  const handleChange = (value:string) => {
    if (isEditMode && changeNeeded) {
      setChangeNeeded(false)
      const title = intl.$t( { defaultMessage: 'Changing 3rd Party Portal Provider' } )
      showActionModal({
        type: 'confirm',
        title: title,
        content: intl.$t({
          defaultMessage: `
                    MSP customers will need to contact MSP administrator to be able to update 
                    WISPr network portal provider settings. Do you want to continue?
                    `
        }),
        okText: intl.$t({ defaultMessage: 'Continue' }),
        onOk: () => {
          setOtherProvider(value === 'Other provider')
          setPreferredProvider(value)
          setCustomProfileName('')
        },
        onCancel: () => form.setFieldValue('external_provider', preferredProvider)
      })
    } else {
      setOtherProvider(value === 'Other provider')
      setPreferredProvider(value)
    }
  }

  const PortalProviders = () => {
    const initialProvider = isEditMode ? preferredProvider : undefined
    return (
      <Form.Item
        name={['external_provider']}
        label={intl.$t({ defaultMessage: 'Select Preferred Provider' })}
        style={{ width: '300px' }}
        initialValue={initialProvider}
        children={
          <Select
            onChange={value => handleChange(value)}
          >
            <Select.Option value={''}>
              {intl.$t({ defaultMessage: 'Select provider' })}
            </Select.Option>
            {externalProviders?.map(item=>{
              return <Select.Option key={item.name} value={item.name}>
                {item.name}
              </Select.Option>
            })}
            <Select.Option value={'Other provider'}>
              {intl.$t({ defaultMessage: 'Other provider' })}
            </Select.Option>
          </Select>
        }
      />
    )
  }

  const AuthAccServerSetting = () => {
    const form = Form.useFormInstance()
    const { useWatch } = Form
    const [enableAccServer ] = [useWatch('enableAccServer')]
    useEffect(() => {
      if (mspLabel?.preferredWisprProvider && mspLabel.preferredWisprProvider.providerName) {
        if (mspLabel.preferredWisprProvider.customExternalProvider) {
          form.setFieldValue('enableAccServer', mspLabel.preferredWisprProvider.acct)
          form.setFieldValue('enableSecondaryServer',
            mspLabel.preferredWisprProvider.auth?.secondary)
          form.setFieldValue('enableAcctSecondaryServer',
            mspLabel.preferredWisprProvider.acct?.secondary)
        }
      }
    }, [mspLabel])

    return <>
      <Divider></Divider>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
            <Form.Item
              name={['preferredWisprProvider', 'providerName']}
              label={intl.$t({ defaultMessage: 'Profile Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 32 }
              ]}
              validateFirst
              hasFeedback
              initialValue={customProfileName || ''}
              children={<Input/>}
              validateTrigger={'onBlur'}
            />
          </Space>
        </GridCol>
      </GridRow>
      <AuthServerSetting/>

      <Subtitle level={4} style={{ marginTop: '15px' }}>
        { intl.$t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
      <Form.Item noStyle name='enableAccServer'>
        <Switch style={{ marginTop: '-5px' }}
          defaultChecked={accountServerEnabled}
          onChange={() => {
            form.setFieldValue('enableAccServer',!enableAccServer)
          }}
        />
      </Form.Item>
      {enableAccServer && <AccServerSetting/>}
    </>
  }

  const AuthServerSetting = () => {
    const ACCT_FORBIDDEN_PORT = 1812
    const form = Form.useFormInstance()
    const { useWatch } = Form
    const [enableSecondaryServer ] = [useWatch('enableSecondaryServer')]
    return <>
      <Divider></Divider>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
            <Subtitle level={4}>
              { intl.$t({ defaultMessage: 'Authentication Service' }) }</Subtitle>

            <Fieldset label={intl.$t({ defaultMessage: 'Primary Server' })}
              checked={true}
              switchStyle={{ display: 'none' }}
            >
              <div>
                <Form.Item
                  name={['preferredWisprProvider', 'auth', 'primary', 'ip']}
                  style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                  rules={[
                    { required: true },
                    { validator: (_, value) => networkWifiIpRegExp(value) }
                  ]}
                  label={intl.$t({ defaultMessage: 'IP Address' })}
                  initialValue={mspLabel?.preferredWisprProvider?.auth?.primary?.ip || ''}
                  children={<Input/>}
                />
                <Form.Item
                  name={['preferredWisprProvider', 'auth', 'primary', 'port']}
                  style={{ display: 'inline-block', width: 'calc(43%)' }}
                  label={intl.$t({ defaultMessage: 'Port' })}
                  rules={[
                    { required: true },
                    { type: 'number', min: 1 },
                    { type: 'number', max: 65535 }
                  ]}
                  initialValue={mspLabel?.preferredWisprProvider?.auth?.primary?.port
                || ACCT_FORBIDDEN_PORT}
                  children={<InputNumber min={1} max={65535} />}
                />
              </div>
              <Form.Item
                name={['preferredWisprProvider', 'auth', 'primary', 'sharedSecret']}
                label={intl.$t({ defaultMessage: 'Shared Secret' })}
                initialValue={mspLabel?.preferredWisprProvider?.auth?.primary?.sharedSecret || ''}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiSecretRegExp(value) }
                ]}
                children={<Input.Password />}
              />
            </Fieldset>
            <Form.Item noStyle name='enableSecondaryServer'>
              <Button
                type='link'
                onClick={() => {
                  form.setFieldValue('enableSecondaryServer',!enableSecondaryServer)
                }}
              >
                {enableSecondaryServer ? intl.$t({ defaultMessage: 'Remove Secondary Server' }):
                  intl.$t({ defaultMessage: 'Add Secondary Server' })}
              </Button>
            </Form.Item>

            {enableSecondaryServer &&
            <Fieldset label={intl.$t({ defaultMessage: 'Secondary Server' })}
              checked={true}
              switchStyle={{ display: 'none' }}
            >
              <div>
                <Form.Item
                  name={['preferredWisprProvider', 'auth', 'secondary', 'ip']}
                  style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                  rules={[
                    { required: true },
                    { validator: (_, value) => networkWifiIpRegExp(value) },
                    { validator: (_, value) => {
                      const primaryIP = form.getFieldValue(['auth', 'primary', 'ip'])
                      const primaryPort = form.getFieldValue(['auth', 'primary', 'port'])
                      const secPort = form.getFieldValue(['auth', 'secondary', 'port'])
                      if(value === primaryIP && primaryPort === secPort){
                        return Promise.reject(
                          intl.$t({ defaultMessage:
                        'IP address and Port combinations must be unique' }))
                      }
                      return Promise.resolve()
                    } }
                  ]}
                  label={intl.$t({ defaultMessage: 'IP Address' })}
                  initialValue={mspLabel?.preferredWisprProvider?.auth?.secondary?.ip || ''}
                  children={<Input/>}
                />
                <Form.Item
                  name={['preferredWisprProvider', 'auth', 'secondary', 'port']}
                  style={{ display: 'inline-block', width: 'calc(43%)' }}
                  label={intl.$t({ defaultMessage: 'Port' })}
                  rules={[
                    { required: true },
                    { type: 'number', min: 1 },
                    { type: 'number', max: 65535 }
                  ]}
                  initialValue={mspLabel?.preferredWisprProvider?.auth?.secondary?.port
                || ACCT_FORBIDDEN_PORT}
                  children={<InputNumber min={1} max={65535} />}
                />
              </div>
              <Form.Item
                name={['preferredWisprProvider', 'auth', 'secondary', 'sharedSecret']}
                label={intl.$t({ defaultMessage: 'Shared Secret' })}
                initialValue={mspLabel?.preferredWisprProvider?.auth?.secondary?.sharedSecret || ''}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiSecretRegExp(value) }
                ]}
                children={<Input.Password />}
              /></Fieldset>}
          </Space>
        </GridCol>
      </GridRow>
    </>
  }

  const AccServerSetting = () => {
    const AUTH_FORBIDDEN_PORT = 1813
    const form = Form.useFormInstance()
    const { useWatch } = Form
    const [enableAccSecondaryServer ] = [useWatch('enableAccSecondaryServer')]
    return <>
      <Divider></Divider>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          <Space direction='vertical' size='middle' style={{ display: 'flex' }}>

            <Fieldset label={intl.$t({ defaultMessage: 'Primary Server' })}
              checked={true}
              switchStyle={{ display: 'none' }}
            >
              <div>
                <Form.Item
                  name={['preferredWisprProvider', 'acct', 'primary', 'ip']}
                  style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                  rules={[
                    { required: true },
                    { validator: (_, value) => networkWifiIpRegExp(value) }
                  ]}
                  label={intl.$t({ defaultMessage: 'IP Address' })}
                  initialValue={mspLabel?.preferredWisprProvider?.acct?.primary?.ip || ''}
                  children={<Input/>}
                />
                <Form.Item
                  name={['preferredWisprProvider', 'acct', 'primary', 'port']}
                  style={{ display: 'inline-block', width: 'calc(43%)' }}
                  label={intl.$t({ defaultMessage: 'Port' })}
                  rules={[
                    { required: true },
                    { type: 'number', min: 1 },
                    { type: 'number', max: 65535 }
                  ]}
                  initialValue={mspLabel?.preferredWisprProvider?.acct?.primary?.port
                || AUTH_FORBIDDEN_PORT}
                  children={<InputNumber min={1} max={65535} />}
                />
              </div>
              <Form.Item
                name={['preferredWisprProvider', 'acct', 'primary', 'sharedSecret']}
                label={intl.$t({ defaultMessage: 'Shared Secret' })}
                initialValue={mspLabel?.preferredWisprProvider?.acct?.primary?.sharedSecret || ''}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiSecretRegExp(value) }
                ]}
                children={<Input.Password />}
              />
            </Fieldset>
            <Form.Item noStyle name='enableAccSecondaryServer'>
              <Button
                type='link'
                onClick={() => {
                  form.setFieldValue('enableAccSecondaryServer',!enableAccSecondaryServer)
                }}
              >
                {enableAccSecondaryServer ? intl.$t({ defaultMessage: 'Remove Secondary Server' }):
                  intl.$t({ defaultMessage: 'Add Secondary Server' })}
              </Button>
            </Form.Item>

            {enableAccSecondaryServer &&
          <Fieldset label={intl.$t({ defaultMessage: 'Secondary Server' })}
            checked={true}
            switchStyle={{ display: 'none' }}
          >
            <div>
              <Form.Item
                name={['preferredWisprProvider', 'acct', 'secondary', 'ip']}
                style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                rules={[
                  { required: true },
                  { validator: (_, value) => networkWifiIpRegExp(value) },
                  { validator: (_, value) => {
                    const primaryIP = form.getFieldValue(['acct', 'primary', 'ip'])
                    const primaryPort = form.getFieldValue(['acct', 'primary', 'port'])
                    const secPort = form.getFieldValue(['acct', 'secondary', 'port'])
                    if(value === primaryIP && primaryPort === secPort){
                      return Promise.reject(
                        intl.$t({ defaultMessage:
                        'IP address and Port combinations must be unique' }))
                    }
                    return Promise.resolve()
                  } }
                ]}
                label={intl.$t({ defaultMessage: 'IP Address' })}
                initialValue={mspLabel?.preferredWisprProvider?.acct?.secondary?.ip || ''}
                children={<Input/>}
              />
              <Form.Item
                name={['preferredWisprProvider', 'acct', 'secondary', 'port']}
                style={{ display: 'inline-block', width: 'calc(43%)' }}
                label={intl.$t({ defaultMessage: 'Port' })}
                rules={[
                  { required: true },
                  { type: 'number', min: 1 },
                  { type: 'number', max: 65535 }
                ]}
                initialValue={mspLabel?.preferredWisprProvider?.acct?.secondary?.port
                || AUTH_FORBIDDEN_PORT}
                children={<InputNumber min={1} max={65535} />}
              />
            </div>
            <Form.Item
              name={['preferredWisprProvider', 'acct', 'secondary', 'sharedSecret']}
              label={intl.$t({ defaultMessage: 'Shared Secret' })}
              initialValue={mspLabel?.preferredWisprProvider?.acct?.secondary?.sharedSecret || ''}
              rules={[
                { required: true },
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<Input.Password />}
            /></Fieldset>}
          </Space>
        </GridCol>
      </GridRow>
    </>
  }

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Settings' })}
      />
      {mspLabel &&
        <StepsForm
          editMode={isEditMode}
          form={form}
          onFinish={isEditMode ? handleUpdateMspLabel : handleAddMspLabel}
          onCancel={() => navigate(linkDashboard, { replace: true })}
          buttonLabel={{ submit: isEditMode ?
            intl.$t({ defaultMessage: 'Save' }):
            intl.$t({ defaultMessage: 'Create' }) }}
        >
          <StepsForm.StepForm name='branding'
            title={intl.$t({ defaultMessage: 'Branding' })}>
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Branding' }) }</Subtitle>
            <Divider></Divider>
            <UI.FieldLabelDomain width='240px'>
              <label>{intl.$t({ defaultMessage: 'Custom Domain' })}</label>
              <Form.Item
                name='msp_label'
                label=''
                initialValue={mspLabel?.msp_label}
                rules={[
                  { required: true,
                    message: intl.$t({ defaultMessage: 'Please enter a domain name' }) },
                  { validator: (_, value) => mspLabelRegExp(value) }
                ]}
                children={<Input />}
                style={{ width: '180px', paddingRight: '10px' }}
              />
              <label>{baseDomainUrl}</label>
            </UI.FieldLabelDomain>

            <div style={{ float: 'left', width: '500px' }}>
              <Subtitle level={4}>
                { intl.$t({ defaultMessage: 'Logo:' }) }</Subtitle>
              <Form.Item
                name='msp_logo'
                valuePropName='checked'
              >
                <Radio.Group value={selectedLogo}
                  onChange={(e: RadioChangeEvent) => {
                    setSelectedLogo(e.target.value)
                    setDefaultFileList([...fileList])}}
                >
                  <Space direction='vertical'>
                    <Radio
                      value='defaultLogo'
                      disabled={false}>
                      { intl.$t({ defaultMessage: 'COMMSCOPE RUCKUS logo' }) }
                    </Radio>
                    <Radio
                      style={{ marginTop: '2px', marginBottom: '20px' }}
                      value='myLogo'
                      disabled={false}>
                      { intl.$t({ defaultMessage: 'My Logo' }) }
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              {selectedLogo !== 'defaultLogo' &&
                  <>
                    <div>{intl.$t({ defaultMessage: '- You can upload up to 5 logos to support' +
                        ' different logo placements' })} <br/>
                    {intl.$t({ defaultMessage: '- Supported formats: PNG, JPG, GIF' })} <br/>
                    {intl.$t({ defaultMessage: '- It is recommended to use logos with ' +
                        'transparent background' })}
                    </div>
                    <Upload
                      action=''
                      listType='picture'
                      accept='image/*'
                      defaultFileList={defaultFileList}
                      beforeUpload={beforeUpload}
                      onRemove={onRemove}
                    >
                      <Button type='link'
                        disabled={fileList.length >= 5}
                      >
                        {intl.$t({ defaultMessage: 'Import Logo' })}
                      </Button>
                    </Upload>
                  </>
              }
            </div>

            <div style={{ float: 'left', marginLeft: '20px', width: '300px' }}>
              <Subtitle level={4}>
                { intl.$t({ defaultMessage: 'Logo Preview:' }) }</Subtitle>
              <Space direction='vertical'>
                <Card
                  title='Portal Header'
                  size='small'
                  headStyle={{ backgroundColor: 'var(--acx-neutrals-20)' }}
                >
                  <Space direction='horizontal'>
                    {selectedLogo !== 'defaultLogo' &&
                      <Form.Item
                        name='logo_uuid'
                        initialValue={
                          fileList.find(file => file.uid === mspLabel.logo_uuid)
                            ? mspLabel.logo_uuid : undefined
                        }
                        rules={[
                          { required: selectedLogo !== 'defaultLogo' ,
                            message: intl.$t({ defaultMessage: 'Please select logo' }) }
                        ]}
                        style={{ marginBottom: '0' }}
                      >
                        <Select
                          placeholder='Select Logo'
                          options={fileList.map(file => {
                            return { label: file.name, value: file.uid }
                          })}
                          onChange={value =>
                            setPortalLogoUrl(fileList.find(file => file.uid === value)?.url ?? '')}
                          style={{ width: '200px' }}
                        />
                      </Form.Item>
                    }
                    <UI.ImagePreviewDark width='355px' height='60px'>
                      {(selectedLogo === 'defaultLogo' || portalLogoUrl) &&
                        <img alt='portal header logo'
                          src={selectedLogo === 'defaultLogo' ? defaultPortalLogo : portalLogoUrl}
                          style={{ marginLeft: '10px', maxHeight: '45px', maxWidth: '300px' }}
                        />
                      }
                    </UI.ImagePreviewDark>
                  </Space>
                </Card>
                <Card
                  title='Customer Login'
                  size='small'
                  headStyle={{ backgroundColor: 'var(--acx-neutrals-20)' }}
                >
                  <Space direction='horizontal'>
                    {selectedLogo !== 'defaultLogo' &&
                      <Form.Item
                        name='ping_login_logo_uuid'
                        initialValue={
                          fileList.find(file => file.uid === mspLabel.ping_login_logo_uuid)
                            ? mspLabel.ping_login_logo_uuid : undefined
                        }
                        rules={[
                          { required: selectedLogo !== 'defaultLogo' ,
                            message: intl.$t({ defaultMessage: 'Please select logo' }) }
                        ]}
                        style={{ marginBottom: '0' }}
                      >
                        <Select
                          placeholder='Select Logo'
                          options={fileList.map(file => {
                            return { label: file.name, value: file.uid }
                          })}
                          onChange={value =>
                            setLoginLogoUrl(fileList.find(file => file.uid === value)?.url ?? '')}
                          style={{ width: '200px' }}
                        />
                      </Form.Item>
                    }
                    <UI.ImagePreviewLight width='355px' height='80px'>
                      {(selectedLogo === 'defaultLogo' || loginLogoUrl) &&
                        <img alt='customer login logo'
                          src={selectedLogo === 'defaultLogo' ? defaultLoginLogo : loginLogoUrl}
                          style={{ margin: 'auto', maxHeight: '80px', maxWidth: '320px' }}
                        />
                      }
                    </UI.ImagePreviewLight>
                  </Space>
                </Card>
                <Card
                  title='Customer Support Emails'
                  size='small'
                  headStyle={{ backgroundColor: 'var(--acx-neutrals-20)' }}
                >
                  <Space direction='horizontal'>
                    {selectedLogo !== 'defaultLogo' &&
                      <Form.Item
                        name='ping_notification_logo_uuid'
                        initialValue={
                          fileList.find(file => file.uid === mspLabel.ping_notification_logo_uuid)
                            ? mspLabel.ping_notification_logo_uuid : undefined
                        }
                        rules={[
                          { required: selectedLogo !== 'defaultLogo' ,
                            message: intl.$t({ defaultMessage: 'Please select logo' }) }
                        ]}
                        style={{ marginBottom: '0' }}
                      >
                        <Select
                          placeholder='Select Logo'
                          options={fileList.map(file => {
                            return { label: file.name, value: file.uid }
                          })}
                          onChange={value =>
                            setSupportLogoUrl(fileList.find(file => file.uid === value)?.url ?? '')}
                          style={{ width: '200px' }}
                        />
                      </Form.Item>
                    }
                    <UI.ImagePreviewDark width='355px' height='60px'>
                      {(selectedLogo === 'defaultLogo' || supportLogoUrl) &&
                        <img alt='customer support logo'
                          src={selectedLogo === 'defaultLogo' ? defaultSupportLogo : supportLogoUrl}
                          style={{ marginLeft: '10px', maxHeight: '45px', maxWidth: '300px' }}
                        />
                      }
                    </UI.ImagePreviewDark>
                  </Space>
                </Card>
                <Card
                  title='Alarm Notification Emails'
                  size='small'
                  headStyle={{ backgroundColor: 'var(--acx-neutrals-20)' }}
                >
                  <Space direction='horizontal'>
                    {selectedLogo !== 'defaultLogo' &&
                      <Form.Item
                        name='alarm_notification_logo_uuid'
                        initialValue={
                          fileList.find(file => file.uid === mspLabel.alarm_notification_logo_uuid)
                            ? mspLabel.alarm_notification_logo_uuid : undefined
                        }
                        rules={[
                          { required: selectedLogo !== 'defaultLogo' ,
                            message: intl.$t({ defaultMessage: 'Please select logo' }) }
                        ]}
                        style={{ marginBottom: '0' }}
                      >
                        <Select
                          placeholder='Select Logo'
                          options={fileList.map(file => {
                            return { label: file.name, value: file.uid }
                          })}
                          onChange={value =>
                            setAlarmLogoUrl(fileList.find(file => file.uid === value)?.url ?? '')}
                          style={{ width: '200px' }}
                        />
                      </Form.Item>
                    }
                    <UI.ImagePreviewLight width='355px' height='80px'>
                      {(selectedLogo === 'defaultLogo' || alarmLogoUrl) &&
                        <img alt='alarm logo'
                          src={selectedLogo === 'defaultLogo' ? defaultAlarmLogo : alarmLogoUrl}
                          style={{ marginLeft: '10px', maxHeight: '80px', maxWidth: '300px' }}
                        />
                      }
                    </UI.ImagePreviewLight>
                  </Space>
                </Card>
              </Space>
            </div>

          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='portalProvider'
            title={intl.$t({ defaultMessage: '3rd Party Portal Providers' })}>
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: '3rd Party Portal Providers' }) }</Subtitle>
            <Divider></Divider>
            <PortalProviders></PortalProviders>
            <div><label>
              {intl.$t({ defaultMessage: 'Only the portal provider you select here will be ' +
        'available to your customers when they set up' })}</label>
            </div>
            <label>
              {intl.$t({ defaultMessage: 'a 3rd party portal (WISPr) network.' })}</label>
            {isOtherProvider && <AuthAccServerSetting />}

          </StepsForm.StepForm>

          <StepsForm.StepForm name='supportLinks'
            title={intl.$t({ defaultMessage: 'Support Links' })}>
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Support links behavior' }) }</Subtitle>
            <Divider/>
            {mspLabel && <div style={{ float: 'left', width: '500px' }} >
              <Subtitle level={4}>
                { intl.$t({ defaultMessage: '1. \'Contact Support\' link behavior' }) }</Subtitle>
              <Form.Item
                name='contact_support_behavior'
                initialValue={showContactSupport}
              >
                <Radio.Group
                  onChange={(e: RadioChangeEvent) => {setContactSupport(e.target.value)}}>
                  <Space direction='vertical'>
                    <Radio
                      value={false}
                      disabled={!showOpenCase}>
                      { intl.$t({ defaultMessage: 'Remove from help menu' }) }
                      <Tooltip
                        placement='topLeft'
                        // eslint-disable-next-line max-len
                        title={intl.$t({ defaultMessage: 'At least one of the following links should be defined: "Contact Support link , Open a Case link" you can not hide both of the links from help menu.' })}
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Radio>
                    <Radio
                      value={true}
                      disabled={false}>
                      { intl.$t({ defaultMessage: 'Redirect to a custom URL' }) }
                    </Radio>
                    {showContactSupport && <Form.Item
                      name='contact_support_url'
                      style={{ width: '300px' }}
                      rules={[
                        { required: true,
                          message: intl.$t({ defaultMessage: 'Please enter URL' }) },
                        { validator: (_, value) => urlRegExp(value) }
                      ]}
                      initialValue={mspLabel?.contact_support_url}
                      children={<Input />}
                    />}
                    {!showContactSupport && <br/>}
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Subtitle level={4}>
                { intl.$t({ defaultMessage: '2. \'Open a Case\' link behavior' }) }</Subtitle>
              <Form.Item
                name='open_case_behavior'
                initialValue={true}
              >
                <Radio.Group onChange={(e: RadioChangeEvent) => {setOpenCase(e.target.value)}}>
                  <Space direction='vertical'>
                    <Radio
                      value={false}
                      disabled={!showContactSupport}>
                      { intl.$t({ defaultMessage: 'Remove from help menu' }) }
                      <Tooltip
                        placement='topLeft'
                        // eslint-disable-next-line max-len
                        title={intl.$t({ defaultMessage: 'At least one of the following links should be defined: "Contact Support link , Open a Case link" you can not hide both of the links from help menu.' })}
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Radio>
                    <Radio
                      value={true}
                      disabled={false}>
                      { intl.$t({ defaultMessage: 'Redirect to a custom URL' }) }
                    </Radio>
                    {showOpenCase && <Form.Item
                      name='open_case_url'
                      style={{ width: '300px' }}
                      rules={[
                        { required: true,
                          message: intl.$t({ defaultMessage: 'Please enter URL' }) },
                        { validator: (_, value) => urlRegExp(value) }
                      ]}
                      initialValue={mspLabel?.open_case_url}
                      children={<Input />}
                    />}
                    {!showOpenCase && <br/>}
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Subtitle level={4}>
                { intl.$t({ defaultMessage: '3. \'My Open Cases\' link behavior' }) }</Subtitle>
              <Form.Item
                name='my_open_case_behavior'
                initialValue={true}
              >
                <Radio.Group onChange={(e: RadioChangeEvent) => {setMyCase(e.target.value)}}>
                  <Space direction='vertical'>
                    <Radio
                      value={false}
                      disabled={false}>
                      { intl.$t({ defaultMessage: 'Remove from help menu' }) }
                    </Radio>
                    <Radio
                      value={true}
                      disabled={false}>
                      { intl.$t({ defaultMessage: 'Redirect to a custom URL' }) }
                    </Radio>
                    {showMyCase && <Form.Item
                      name='my_open_case_url'
                      style={{ width: '300px' }}
                      rules={[
                        { required: true,
                          message: intl.$t({ defaultMessage: 'Please enter URL' }) },
                        { validator: (_, value) => urlRegExp(value) }
                      ]}
                      initialValue={mspLabel?.my_open_case_url}
                      children={<Input />}
                    />}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>}
            <div style={{ float: 'left', width: '300px' }}>
              <img src={supportLinkImg} alt={intl.$t({ defaultMessage: 'Support link image' })} />
            </div>

          </StepsForm.StepForm>

          <StepsForm.StepForm name='contactInfo'
            title={intl.$t({ defaultMessage: 'Contact Info' })}>
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: 'Contact information for emails footer' }) }</Subtitle>
            <Divider></Divider>
            <Form.Item
              name='msp_phone'
              label={intl.$t({ defaultMessage: 'Phone' })}
              style={{ width: '300px' }}
              initialValue={mspLabel?.msp_phone}
              rules={[
                { validator: (_, value) => phoneRegExp(value) }
              ]}
              children={
                <PhoneInput
                  name={'msp_phone'}
                  callback={(value) => form.setFieldValue('msp_phone', value)}
                  onTop={false}
                />
              }
            />
            <Form.Item
              name='msp_email'
              label={intl.$t({ defaultMessage: 'Email' })}
              style={{ width: '300px' }}
              rules={[
                { required: true },
                { validator: (_, value) => emailRegExp(value) }
              ]}
              initialValue={mspLabel?.msp_email}
              children={<Input/>}
            />
            <Form.Item
              name='msp_website'
              label={intl.$t({ defaultMessage: 'Website' })}
              style={{ width: '300px' }}
              rules={[
                { required: true },
                { validator: (_, value) => urlRegExp(value) }
              ]}
              initialValue={mspLabel?.msp_website}
              children={<Input/>}
            />
          </StepsForm.StepForm>

        </StepsForm>
      }
    </>
  )
}
