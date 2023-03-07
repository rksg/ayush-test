import { useEffect, useRef, useState } from 'react'

import { RcFile }  from 'antd/lib/upload'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useGetPortalQuery, useSavePortalMutation, useUpdatePortalMutation, useUploadURLMutation } from '@acx-ui/rc/services'
import { defaultAlternativeLang, defaultComDisplay, getServiceListRoutePath, Portal }              from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                   from '@acx-ui/react-router-dom'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'

import PortalFormContext from './PortalFormContext'
import PortalSettingForm from './PortalSettingForm'


const initialPortalData : Portal ={
  serviceName: '',
  network: [],
  content: {
    bgColor: '#FFFFFF',
    bgImage: '',
    welcomeText: '',
    welcomeColor: '#333333',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: '',
    secondaryColor: '#333333',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: '#EC7100',
    poweredBgColor: '#FFFFFF',
    poweredColor: '#333333',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgRatio: PortalDemoDefaultSize.poweredImgRatio,
    wifi4EUNetworkId: '',
    termsCondition: '',
    componentDisplay: defaultComDisplay ,
    displayLangCode: 'en',
    alternativeLang: defaultAlternativeLang,
    alternativeLangCode: []
  }

}

export const PortalForm = (props:{
  editMode?:boolean,
  networkView?:boolean,
  backToNetwork?: (value?: Portal) => void
}) => {
  const { networkView, backToNetwork } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink(getServiceListRoutePath(true))
  const params = useParams()
  const prefix = '/api/file/tenant/'+params.tenantId+'/'
  const editMode = props.editMode && !networkView
  const [portalData, setPortalData]=useState<Portal>(initialPortalData)
  const formRef = useRef<StepsFormInstance<Portal>>()
  const [uploadURL] = useUploadURLMutation()
  const { data } = useGetPortalQuery({ params })
  const [savePortal] = useSavePortalMutation()
  const [updatePortal] = useUpdatePortalMutation()
  const updateFileId = async (file: RcFile) =>{
    let fileId = ''
    await uploadURL({ params, payload: { fileExtension:
      file.name.split('.')[1] } }).unwrap().then( async res=>{
      await fetch(res.signedUrl, { method: 'put', body: file, headers: {
        'Content-Type': ''
      } }).then(()=>{
        fileId = res.fileId
      })
    })
    return fileId
  }
  const handleAddPortalService = async (data : Portal) => {
    try {
      const payload = { serviceName: data.serviceName, tags: 'test', content: {
        ...data.content, logo: data?.content?.logo&&data?.content?.logo.indexOf(prefix)>=0?
          data?.content?.logo?.replace(prefix,''): '',
        photo: data?.content?.photo&&data?.content?.photo.indexOf(prefix)>=0?
          data?.content?.photo?.replace(prefix,''): '',
        poweredImg: data?.content?.poweredImg&&data?.content?.poweredImg.indexOf(prefix)>=0?
          data?.content?.poweredImg?.replace(prefix,''): '',
        bgImage: data?.content?.bgImage&&data?.content?.bgImage.indexOf(prefix)>=0?
          data?.content?.bgImage?.replace(prefix,''): ''
      } }
      if(portalData.bgFile){
        payload.content.bgImage = await updateFileId(portalData.bgFile)
      }
      if(portalData.logoFile){
        payload.content.logo = await updateFileId(portalData.logoFile)
      }
      if(portalData.photoFile){
        payload.content.photo = await updateFileId(portalData.photoFile)
      }
      if(portalData.poweredFile){
        payload.content.poweredImg = await updateFileId(portalData.poweredFile)
      }

      if(editMode){
        updatePortal({ params: { tenantId: params.tenantId, serviceId: params.serviceId },
          payload: payload }).unwrap()
      }
      else await savePortal({ params: { tenantId: params.tenantId }, payload: payload }).unwrap()
        .then((res)=>{
          data.id = res.response?.id
          data.content = payload.content
        })
      networkView? backToNetwork?.(data) : navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const updateSaveData = (saveData: Partial<Portal>) => {
    setPortalData({ ...portalData, ...saveData })
  }
  useEffect(() => {
    if (data) {
      const formatData = { ...data, content: {
        ...data.content, logo: data.content?.logo ? (prefix+data.content.logo):Logo,
        photo: data.content?.photo ? (prefix+data.content.photo):Photo,
        poweredImg: data.content?.poweredImg ? (prefix+data.content.poweredImg):Powered,
        bgImage: data.content?.bgImage ? (prefix+data.content.bgImage):'' } } as Portal
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(formatData)
      updateSaveData(formatData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <>
      {!networkView && <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit Portal Service' })
          :$t({ defaultMessage: 'Add Portal Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/service' }
        ]}
      />}
      <PortalFormContext.Provider value={{ editMode, portalData, setPortalData }}>
        <StepsForm<Portal>
          formRef={formRef}
          onCancel={() => networkView? backToNetwork?.()
            : navigate(linkToServices)}
          onFinish={async (data) => {
            if((data.content.componentDisplay.wifi4eu && !data.content.wifi4EUNetworkId?.trim())||
              (data.content.componentDisplay.termsConditions&&!
              data.content.termsCondition?.trim())){
              return false
            }
            return handleAddPortalService(data)}}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialPortalData}
          >
            <PortalSettingForm resetDemoField={()=>{
              formRef.current?.setFieldsValue({ content: { ...portalData.content } })
            }}/>
          </StepsForm.StepForm>
        </StepsForm>
      </PortalFormContext.Provider>
    </>
  )
}

export default PortalForm
