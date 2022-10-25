import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useGetPortalQuery }                     from '@acx-ui/rc/services'
import { defaultComDisplay, Portal }             from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import Photo                     from '../../../../assets/images/portal-demo/main-photo.svg'
import Powered                   from '../../../../assets/images/portal-demo/powered-logo-img.svg'
import Logopng                   from '../../../../assets/images/portal-demo/small-logo-img.png'
import { PortalDemoDefaultSize } from '../../commonUtils'
import PortalScopeForm           from '../PortalScope/PortalScopeForm'
import { PortalSummaryForm }     from '../PortalSummary/PortalSummaryForm'

import PortalFormContext from './PortalFormContext'
import PortalSettingForm from './PortalSettingForm'

const initialPortalData : Portal ={
  serviceName: '',
  network: [],
  demo: {
    welcomeText: 'Welcome to the Guest Access login page',
    welcomeColor: 'var(--acx-primary-black)',
    welcomeSize: PortalDemoDefaultSize.welcomeSize,
    photo: Photo,
    photoSize: PortalDemoDefaultSize.photoSize,
    logo: Logopng,
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
    alternativeLang: {}
  }

}

const PortalForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const params = useParams()
  const editMode = params.action === 'edit'
  const [portalData, setPortalData]=useState<Portal>(initialPortalData)
  const [error, setError]=useState(false)
  const formRef = useRef<StepsFormInstance<Portal>>()

  const { data } = useGetPortalQuery({ params })

  const handleAddPortalService = async (data : Portal) => {
    try {
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
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
        title={$t({ defaultMessage: 'Add Portal Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Service' }), link: '/service' }
        ]}
      />
      <PortalFormContext.Provider value={{ editMode, portalData, setPortalData, error }}>
        <StepsForm<Portal>
          formRef={formRef}
          onCancel={() => navigate(linkToServices)}
          onFinish={(data) => handleAddPortalService(data)}
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'Settings' })}
            initialValues={initialPortalData}
            onFinish={async (data) => {
              if(data.demo.componentDisplay.WiFi4EU && !data.demo.wifi4EU){
                setError(true)
                return false
              }
              setError(false)
              setPortalData({ ...portalData, ...data })
              return true
            }}
          >
            <PortalSettingForm />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='scope'
            title={$t({ defaultMessage: 'Scope' })}
            onFinish={async (data) => {
              setPortalData({ ...portalData, ...data })
              return true
            }}
          >
            <PortalScopeForm />
          </StepsForm.StepForm>

          {!editMode&&<StepsForm.StepForm
            name='summary'
            title={$t({ defaultMessage: 'Summary' })}
          >
            <PortalSummaryForm summaryData={portalData}/>
          </StepsForm.StepForm>}
        </StepsForm>
      </PortalFormContext.Provider>
    </>
  )
}

export default PortalForm
