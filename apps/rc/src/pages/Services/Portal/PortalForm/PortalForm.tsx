import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useGetPortalQuery }                                 from '@acx-ui/rc/services'
import { defaultAlternativeLang, defaultComDisplay, Portal } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }             from '@acx-ui/react-router-dom'

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
    backgroundColor: 'var(--acx-primary-white)',
    backgroundImage: '',
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoSize: PortalDemoDefaultSize.photoSize,
    logo: Logo,
    logoSize: PortalDemoDefaultSize.logoSize,
    secondaryText: 'Lorem ipsum dolor sit amet, '+
    'consectetur adipiscing elit. Aenean euismod bibendum laoreet.',
    secondaryColor: 'var(--acx-primary-black)',
    secondarySize: PortalDemoDefaultSize.secondarySize,
    buttonColor: 'var(--acx-accents-orange-50)',
    poweredBackgroundColor: 'var(--acx-primary-white)',
    poweredColor: 'var(--acx-primary-black)',
    poweredSize: PortalDemoDefaultSize.poweredSize,
    poweredImg: Powered,
    poweredImgSize: PortalDemoDefaultSize.poweredImgSize,
    wifi4EU: '',
    termsCondition: '',
    componentDisplay: defaultComDisplay ,
    displayLang: 'English',
    alternativeLang: defaultAlternativeLang
  }

}

export const PortalForm = (props:{
  networkView?:boolean,
  backToNetwork?: (value?: Portal) => void
}) => {
  const { networkView, backToNetwork } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
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
              if(data.demo.componentDisplay.WiFi4EU && !data.demo.wifi4EU){
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
