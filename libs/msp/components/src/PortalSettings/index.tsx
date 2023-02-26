import { useState, useRef, useEffect } from 'react'

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
import { Button, Upload } from 'antd'
import { select }         from 'd3'
import { isEmpty }        from 'lodash'
import { useIntl }        from 'react-intl'

import {
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Subtitle
} from '@acx-ui/components'
import {
  useAddMspLabelMutation,
  useExternalProvidersQuery,
  useGetMspBaseURLQuery,
  useGetMspLabelQuery,
  useGetUploadURLMutation,
  useUpdateMspLabelMutation
} from '@acx-ui/rc/services'
import {
  emailRegExp,
  phoneRegExp,
  MspPortal,
  Providers,
  FileValidation,
  UploadUrlResponse,
  MspLogoFile
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import logoAlarmImg   from '../images/ruckus-alarm-cloud.png'
import logoCloudImg   from '../images/ruckus-logo-cloud.png'
import supportLinkImg from '../images/supportlink.png'
import * as UI        from '../styledComponents'

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
  const formRef = useRef<StepsFormInstance<MspPortal>>()
  // const { Option } = Select
  const params = useParams()
  const fileUrl = '/api/file/tenant/' + params.tenantId + '/'

  const linkDashboard = useTenantLink('/dashboard', 'v')
  const [selectedLogo, setSelectedLogo] = useState('defaultLogo')
  // const [file, setFile] = useState<File>({} as File)
  const validateFile = function (_fileValidation: FileValidation) {
    // formRef.setFieldValue('imageName', _fileValidation.file.name)
    // formRef.current?.validateFields(['mspLogoFiles']) // DON'T NEED B/C FIELD IS NOT REQUIRED
    // setFile(_fileValidation.file)
  }
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [defaultFileList, setDefaultFileList] = useState<UploadFile[]>([])
  const [getUploadURL] = useGetUploadURLMutation()
  const [alarmLogoUrl, setAlarmLogoUrl] = useState('')

  const [showContactSupport, setContactSupport] = useState(false)
  const [showOpenCase, setOpenCase] = useState(true)
  const [showMyCase, setMyCase] = useState(true)

  const [isEditMode, setEditMode] = useState(false)
  // const [editFormData, setEditFormData]=useState<MspPortal>()

  const [externalProviders, setExternalProviders]=useState<Providers[]>()

  // const { action, tenantId, mspEcTenantId } = useParams()

  const [addMspLabel] = useAddMspLabelMutation()
  const [updateMspLabel] = useUpdateMspLabelMutation()

  const { data: provider } = useExternalProvidersQuery({ params })
  const { data: baseUrl } = useGetMspBaseURLQuery({ params })
  const { data: mspLabel } = useGetMspLabelQuery({ params })

  useEffect(() => {
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
      if (mspLabel.mspLogoFileDataList) {
        // const getDataListUploadURL = async () => {
        //   const uploadUrls = mspLabel.mspLogoFileDataList?.map((file) => {
        //     const extension: string = getFileExtension(file.logo_file_name)
        //     return getUploadURL({
        //       params: { ...params },
        //       payload: { fileExtension: extension }
        //     }).unwrap().then((uploadUrl) => {
        //       return fetch(uploadUrl.signedUrl, { method: 'get', headers: {
        //         'Content-Type': ''
        //       } })
        //     })
        //   })
        // }
        // if (mspLabel.mspLogoFileDataList) {
        //   getDataListUploadURL()
        // }
        // const defaultList = uploadUrls.map((uploadUrl) => {
        //   return fetch(uploadUrl.data.signedUrl, { method: 'get', headers: {
        //     'Content-Type': ''
        //   } })
        //   // return {
        //   //   uid: file.id,
        //   //   name: file.logo_file_name,
        //   //   fileName: file.logo_file_name
        //   // }
        // })
        // setFileList(defaultList as UploadFile[])   // TODO: check this is correct data type received from backend
      }
      if (mspLabel.mspLogoFileDataList) {
        const defaultList = mspLabel.mspLogoFileDataList.map((file) => {
          return {
            uid: file.logo_fileuuid,
            name: file.logo_file_name,
            fileName: file.logo_file_name,
            url: fileUrl + file.logo_fileuuid,
            status: 'done'
          }
        }) as UploadFile[]
        setDefaultFileList(defaultList)
        setFileList(defaultList)
        setSelectedLogo('myLogo')
        // setAlarmLogoUrl(fileUrl + mspLabel.alarm_notification_logo_uuid)
        mspLabel.alarm_notification_logo_uuid     // TODO: update this after changing workflow to grab fileList from logo preview uuids and not data list
          ? setAlarmLogoUrl(fileUrl + mspLabel.alarm_notification_logo_uuid)
          : setAlarmLogoUrl(logoCloudImg)
      }
      else {
        setAlarmLogoUrl(logoCloudImg)
      }
      // mspLabel.alarm_notification_logo_uuid
      //   ? setAlarmLogoUrl(fileUrl + mspLabel.alarm_notification_logo_uuid)
      //   : setAlarmLogoUrl(logoCloudImg)
      // const formData = { ...mspLabel }
      // setEditFormData(formData)
    }
  }, [provider, mspLabel])

  const beforeUpload = function (file: File) {
    const acceptedImageTypes = ['image/png', 'image/jpg', 'image/gif']
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = intl.$t({ defaultMessage: 'Invalid Image type!' })
      showToast({
        type: 'error',
        content
      })
      return
    }
    const isLt750K = file.size / 1024 / 1024 < 1     //TODO: UPDATE TO 0.75?
    if (!isLt750K) {
      const content = intl.$t({ defaultMessage: 'Image must be smaller than 750KB!' })
      showToast({
        type: 'error',
        content
      })
      return
    }
    const newFile = file as unknown as UploadFile
    newFile.url = URL.createObjectURL(file)
    const newFileList = [ ...fileList, newFile ]
    setFileList(newFileList)
    return false
  }

  const onRemove = function (file : UploadFile) {
    const newFileList = fileList.filter(f => f.uid !== file.uid)
    setFileList(newFileList)
    // Remove image from logo previews
    if (formRef.current?.getFieldValue('alarm_notification_logo_uuid') === file.uid) {
      formRef.current?.setFieldValue('alarm_notification_logo_uuid', undefined)
      setAlarmLogoUrl('')
    }
  }

  const handleAddMspLabel = async (values: MspPortal) => {
    try {
      const formData = { ...values }
      await addMspLabel({ params, payload: formData }).unwrap()
      navigate(linkDashboard, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const getFilesUploadURL = async function (files : UploadFile[]) {
    return await Promise.all(files.map((file) => {
      const extension: string = getFileExtension(file.name)
      return getUploadURL({
        params: { ...params },
        payload: { fileExtension: extension }
      }).unwrap().then((uploadUrl) => {
        return {
          fileName: file.name,
          fileId: file.uid,
          file: file,    // TODO: not needed if fetch is not needed in handleUpdateMspLabel()
          data: uploadUrl
        }
      })
    }))
  }

  const updateFormFileIds = function (values: MspPortal,
    uploadUrls: { fileName: string, fileId: string, data: UploadUrlResponse }[]) {
    if (values.alarm_notification_logo_uuid) {
      const file = uploadUrls.find(f => f.fileId === values.alarm_notification_logo_uuid)
      if (file) {
        values.alarm_notification_logo_uuid = file.data.fileId
      }
    }
    return values
  }

  const getDefaultLogoUuid = async function ()
  {
    const defaultLogoFile = await fetch(logoCloudImg)
      .then(res => res.blob())
      .then(blob => {
        return new File([blob], logoCloudImg, { type: 'image/png' })
      })
    const imageType: string = logoCloudImg.split(';base64', 1).at(0) ?? ''
    if (!imageType) {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
    const extension: string = getFileExtension(imageType)

    const uploadUrl = await getUploadURL({
      params: { ...params },
      payload: { fileExtension: extension }
    }) as { data: UploadUrlResponse }

    if (uploadUrl && uploadUrl.data && uploadUrl.data.fileId) {
      await fetch(uploadUrl.data.signedUrl, { method: 'put', body: defaultLogoFile, headers: {
        'Content-Type': ''
      } })
      return uploadUrl.data.fileId
    }
    return
  }

  const handleUpdateMspLabel = async (values: MspPortal) => {
    try {
      const portal: MspPortal = {}
      if (selectedLogo === 'defaultLogo') {
        const formData = { ...mspLabel, ...values }
        const defaultLogoUid = await getDefaultLogoUuid()

        portal.msp_label = formData.msp_label
        portal.default_logo_uuid = defaultLogoUid
        portal.contact_support_url = showContactSupport ? formData.contact_support_url : ''
        portal.open_case_url = showOpenCase ? formData.open_case_url : ''
        portal.my_open_case_url = showMyCase ? formData.my_open_case_url : ''
        portal.msp_phone = formData.msp_phone
        portal.msp_email = formData.msp_email
        portal.msp_website = formData.msp_website
        // preferredWisprProvider?: MspPreferredWisprProvider;
      }
      else {
        // TODO: need to make sure that files uploaded haven't already been uploaded to google? in which case don't need to call fetch nor use await promise for logoFileDataList
        const uploadedFiles = fileList.filter(file => file.status === 'done')
        const newFiles = fileList.filter(file => file.status !== 'done')
        const uploadUrls = await getFilesUploadURL(newFiles)
        const uploadedFileDataList: MspLogoFile[] = uploadedFiles.map((file) => {
          return {
            logo_fileuuid: file.uid,
            logo_file_name: file.name
          }
        })
        const newFileList = uploadUrls ? await Promise.all(uploadUrls.map((uploadUrl) => {
          // TODO: check if fetch is needed, or if already handled by getUploadURL()
          const file = uploadUrl.file as unknown as File
          fetch(uploadUrl.data.signedUrl, { method: 'put', body: file, headers: {
            'Content-Type': ''
          } })
          const logoFileData: MspLogoFile = {
            logo_fileuuid: uploadUrl.data.fileId,
            logo_file_name: uploadUrl.fileName
          }
          return logoFileData
        })) : []
        const logoFileDataList = uploadedFileDataList.concat(newFileList)
        values = uploadUrls ? updateFormFileIds({ ...values }, uploadUrls) : values
        const formData = { ...mspLabel, ...values }

        portal.msp_label = formData.msp_label
        portal.logo_uuid = logoFileDataList.at(0)?.logo_fileuuid   // TODO: replace these logo_uuid values with actual values after implementing Logo Preview
        portal.alarm_notification_logo_uuid = formData.alarm_notification_logo_uuid
        portal.ping_notification_logo_uuid = logoFileDataList.at(0)?.logo_fileuuid
        portal.mlisa_logo_uuid = logoFileDataList.at(0)?.logo_fileuuid
        portal.ping_login_logo_uuid = logoFileDataList.at(0)?.logo_fileuuid
        // default_logo_uuid: formData.default_logo_uuid,
        portal.mspLogoFileDataList = logoFileDataList
        portal.contact_support_url = showContactSupport ? formData.contact_support_url : ''
        portal.open_case_url = showOpenCase ? formData.open_case_url : ''
        portal.my_open_case_url = showMyCase ? formData.my_open_case_url : ''
        portal.msp_phone = formData.msp_phone
        portal.msp_email = formData.msp_email
        portal.msp_website = formData.msp_website
        // preferredWisprProvider?: MspPreferredWisprProvider;
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

      await updateMspLabel({ params, payload: portal }).unwrap()
      navigate(linkDashboard, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

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

  return (
    <>
      <PageHeader
        title={intl.$t({ defaultMessage: 'Settings' })}
      />
      {mspLabel &&
        <StepsForm
          editMode={isEditMode}
          formRef={formRef}
          onFinish={isEditMode ? handleUpdateMspLabel : handleAddMspLabel}
          onCancel={() => navigate(linkDashboard)}
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
                  { required: true },
                  { validator: (_, value) => mspLabelRegExp(value) },
                  { message: intl.$t({ defaultMessage: 'Please enter a valid domain name' }) }
                ]}
                children={<Input />}
                style={{ width: '180px', paddingRight: '10px' }}
              />
              <label>{baseUrl?.base_url}</label>
            </UI.FieldLabelDomain>

            <div style={{ float: 'left', width: '500px' }}>
              <Subtitle level={4}>
                { intl.$t({ defaultMessage: 'Logo:' }) }</Subtitle>
              <Form.Item
                name='msp_logo'
                valuePropName='checked'
              >
                <Radio.Group onChange={(e: RadioChangeEvent) => {setSelectedLogo(e.target.value)}}
                  value={selectedLogo}
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
                    <div><label>{intl.$t({
                      defaultMessage: '- You can upload up to 5 logos to support' +
                        ' different logo placements'
                    })}</label></div>
                    <div><label>{intl.$t({
                      defaultMessage: '- Supported formats: PNG, JPG, GIF'
                    })}
                    </label></div><div><label>{intl.$t({
                      defaultMessage: '- Maximal file size is 750 Kb'
                    })}
                    </label></div><div><label>{intl.$t({
                      defaultMessage: '- It is recommended to use logos with ' +
                        'transparent background'
                    })}</label></div>
                    <Upload
                      action=''
                      listType='picture'
                      accept='image/*'
                      defaultFileList={defaultFileList}
                      beforeUpload={beforeUpload}
                      onRemove={onRemove}
                      maxCount={5}
                    >
                      <Button type='link'>{intl.$t({ defaultMessage: 'Import Logo' })}</Button>
                    </Upload>
                  </>
              }
            </div>

            <div style={{ float: 'left', marginLeft: '20px', width: '300px' }}>
              {/* TODO: might not need width here */}
              <Subtitle level={4}>
                { intl.$t({ defaultMessage: 'Logo Preview:' }) }</Subtitle>
              <Space direction='vertical'>
                <Card
                  title='Alarm Notification Emails'
                  size='small'
                >
                  <Space direction='horizontal'>
                    <Form.Item
                      name='alarm_notification_logo_uuid'
                      valuePropName='value'       // TODO: check if this is needed
                      initialValue={mspLabel.alarm_notification_logo_uuid}
                    >
                      {selectedLogo !== 'defaultLogo' &&
                        <Select
                          placeholder='Select Logo'
                          options={fileList.map(file => {
                            return { label: file.name, value: file.uid }
                          })}
                          onChange={value =>
                            setAlarmLogoUrl(fileList.find(file => file.uid === value)?.url ?? '')}
                          style={{ width: '200px' }}
                        />
                      }
                    </Form.Item>
                    <div style={{ backgroundColor: '#333333', height: '80px', width: '355px' }}>
                      {/* TODO: change color to #f7f7f7 */}
                      {alarmLogoUrl &&
                        <img alt='alarm_logo'
                          src={selectedLogo === 'defaultLogo' ? logoCloudImg : alarmLogoUrl}
                          style={{ maxHeight: '80px', maxWidth: '300px' }}
                        />
                      }
                    </div>
                  </Space>
                </Card>
              </Space>
            </div>

          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='portalProfilder'
            title={intl.$t({ defaultMessage: '3rd Party Portal Providers' })}>
            <Subtitle level={3}>
              { intl.$t({ defaultMessage: '3rd Party Portal Providers' }) }</Subtitle>
            <Divider></Divider>
            <Form.Item
              name='external_provider'
              label={intl.$t({ defaultMessage: 'Select Preferred Provider' })}
              style={{ width: '300px' }}
              rules={[{ required: true }]}
              initialValue={intl.$t({ defaultMessage: 'Select preferred provider' })}
              children={
                <Select>
                  {externalProviders?.map(item=>{
                    return <Select.Option key={item.name} value={item.name}>
                      {item.name}
                    </Select.Option>
                  })}
                </Select>
              }
            />
            <div><label>
              {intl.$t({ defaultMessage: 'Only the portal provider you select here will be ' +
        'available to your customers when they set up' })}</label>
            </div>
            <label>
              {intl.$t({ defaultMessage: 'a 3rd party portal (WISPr) network.' })}</label>

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
                        { required: true },
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
                        { required: true },
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
                        { required: true },
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
              children={<Input/>}
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
