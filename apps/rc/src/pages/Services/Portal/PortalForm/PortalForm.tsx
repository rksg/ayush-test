import { useEffect, useRef, useState } from 'react'

import { RcFile }  from 'antd/lib/upload'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                         from '@acx-ui/feature-toggle'
import { useGetPortalQuery, useSavePortalMutation, useUpdatePortalMutation, useUploadURLMutation }                                        from '@acx-ui/rc/services'
import { defaultAlternativeLang, defaultComDisplay, getServiceListRoutePath, getServiceRoutePath, Portal, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                                                          from '@acx-ui/react-router-dom'
import { loadImageWithJWT }                                                                                                               from '@acx-ui/utils'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'

import PortalFormContext from './PortalFormContext'
import PortalSettingForm from './PortalSettingForm'


export const initialPortalData : Portal ={
  serviceName: '',
  network: [],
  content: {
    bgColor: '#FFFFFF',
    bgImage: '',
    welcomeText: undefined,
    welcomeColor: '#333333',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: undefined,
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
  const tablePath = getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.LIST })
  const linkToServices = useTenantLink(tablePath)
  const params = useParams()
  const editMode = props.editMode && !networkView
  const [portalData, setPortalData]=useState<Portal>(initialPortalData)
  const [currentLang, setCurrentLang]=useState({} as { [key:string]:string })
  const formRef = useRef<StepsFormLegacyInstance<Portal>>()
  const [uploadURL] = useUploadURLMutation()
  const { data } = useGetPortalQuery({ params })
  const [savePortal] = useSavePortalMutation()
  const [updatePortal] = useUpdatePortalMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
        ...data.content,
        logo: data?.content?.logo&&data?.content?.logo.indexOf('https://storage')>=0?
          data?.content?.logo?.split('/')[6].split('?')[0]: '',
        photo: data?.content?.photo&&data?.content?.photo.indexOf('https://storage')>=0?
          data?.content?.photo?.split('/')[6].split('?')[0]: '',
        poweredImg: data?.content?.poweredImg&&
        data?.content?.poweredImg.indexOf('https://storage')>=0?
          data?.content?.poweredImg?.split('/')[6].split('?')[0]: '',
        bgImage: data?.content?.bgImage&&data?.content?.bgImage.indexOf('https://storage')>=0?
          data?.content?.bgImage?.split('/')[6].split('?')[0]: ''
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
    const fetchData= async (data:Portal) =>{
      const formatData = { ...data, content: {
        ...data.content, logo: data.content?.logo ?
          await loadImageWithJWT(data.content.logo):Logo,
        photo: data.content?.photo ? await loadImageWithJWT(data.content.photo):Photo,
        poweredImg: data.content?.poweredImg ?
          await loadImageWithJWT(data.content.poweredImg):Powered,
        bgImage: data.content?.bgImage ?
          await loadImageWithJWT(data.content.bgImage):'' } } as Portal
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(formatData)
      updateSaveData(formatData)
    }
    if(data){
      fetchData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <>
      {!networkView && <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit Portal Service' })
          :$t({ defaultMessage: 'Add Portal Service' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Guest Portal' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Portal Services' }), link: tablePath }
        ]}
      />}
      <PortalFormContext.Provider value={{ editMode, portalData, setPortalData,
        currentLang, setCurrentLang }}>
        <StepsFormLegacy<Portal>
          formRef={formRef}
          onCancel={() => networkView? backToNetwork?.()
            : navigate(linkToServices)}
          onFinish={async (data) => {
            if((data.content.componentDisplay.wifi4eu && !data.content.wifi4EUNetworkId?.trim())||
              (data.content.componentDisplay.termsConditions&&!
              data.content.termsCondition?.trim())){
              return false
            }
            if(data.content.welcomeText===undefined){
              data.content.welcomeText=currentLang.welcomeText
            }
            if(data.content.secondaryText===undefined){
              data.content.secondaryText=currentLang.secondaryText
            }
            return handleAddPortalService(data)}}
        >
          <StepsFormLegacy.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialPortalData}
          >
            <PortalSettingForm resetDemoField={()=>{
              formRef.current?.setFieldsValue({ content: { ...portalData.content } })
            }}/>
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </PortalFormContext.Provider>
    </>
  )
}

export default PortalForm
