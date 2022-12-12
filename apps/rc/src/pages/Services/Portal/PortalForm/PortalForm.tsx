import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useGetPortalQuery }                                                          from '@acx-ui/rc/services'
import { defaultAlternativeLang, defaultComDisplay, getServiceListRoutePath, Portal } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                      from '@acx-ui/react-router-dom'

import Photo                     from '../../../../assets/images/portal-demo/PortalPhoto.svg'
import Powered                   from '../../../../assets/images/portal-demo/PoweredLogo.svg'
import Logo                      from '../../../../assets/images/portal-demo/RuckusCloud.svg'
import { PortalDemoDefaultSize } from '../../commonUtils'

import PortalFormContext from './PortalFormContext'
import PortalSettingForm from './PortalSettingForm'

const initialPortalData : Portal ={
  serviceName: '',
  network: [],
  demo: {
    bgColor: 'var(--acx-primary-white)',
    bgImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoRatio: PortalDemoDefaultSize.photoRatio,
    logo: Logo,
    logoRatio: PortalDemoDefaultSize.logoRatio,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
    'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBgColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
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
  networkView?:boolean,
  backToNetwork?: (value?: Portal) => void
}) => {
  const { networkView, backToNetwork } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink(getServiceListRoutePath(true))
  const params = useParams()
  const editMode = params.action === 'edit' && !networkView
  const [portalData, setPortalData]=useState<Portal>(initialPortalData)
  const formRef = useRef<StepsFormInstance<Portal>>()

  const { data } = useGetPortalQuery({ params })

  const handleAddPortalService = async (data : Portal) => {
    networkView? backToNetwork?.(data) : navigate(linkToServices, { replace: true })
    // try {
    //   networkView? backToNetwork?.() : navigate(linkToServices, { replace: true })
    // } catch {
    //   showToast({
    //     type: 'error',
    //     content: $t({ defaultMessage: 'An error occurred' })
    //   })
    // }
  }
  const updateSaveData = (saveData: Partial<Portal>) => {
    setPortalData({ ...portalData, ...saveData })
  }
  useEffect(() => {
    //formRef?.current?.setFieldsValue(portalData)
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  return (
    <>
      <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit Portal Service' })
          :$t({ defaultMessage: 'Add Portal Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/service' }
        ]}
      />
      <PortalFormContext.Provider value={{ editMode, portalData, setPortalData }}>
        <StepsForm<Portal>
          formRef={formRef}
          onCancel={() => networkView? backToNetwork?.()
            : navigate(linkToServices)}
          onFinish={(data) => handleAddPortalService(data)}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialPortalData}
            onFinish={async (data) => {
              if(data.demo.componentDisplay.wifi4eu && !data.demo.wifi4EUNetworkId){
                return false
              }
              updateSaveData(data)
              return true
            }}
          >
            <PortalSettingForm resetDemoField={()=>{
              formRef.current?.setFieldsValue({ demo: { ...portalData.demo } })
            }}/>
          </StepsForm.StepForm>
        </StepsForm>
      </PortalFormContext.Provider>
    </>
  )
}

export default PortalForm
