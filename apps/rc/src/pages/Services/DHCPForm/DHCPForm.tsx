import { useState, useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useGetDHCPProfileQuery }                             from '@acx-ui/rc/services'
import { DHCPSaveData, DHCPConfigTypeEnum }                   from '@acx-ui/rc/utils'
import { useParams, useTenantLink, useNavigate, useLocation } from '@acx-ui/react-router-dom'

import DHCPFormContext from './DHCPFormContext'
import { SettingForm } from './DHCPSettingForm'
import { SummaryForm } from './DHCPSummary/SummaryForm'
import { Venues }      from './DHCPVenues/Venues'


export function DHCPForm () {
  const { $t } = useIntl()

  const params = useParams()
  type LocationState = {
    origin: { pathname: string },
    param: object
  }
  const locationState:LocationState = useLocation().state as LocationState

  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance<DHCPSaveData>>()

  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')


  //API Call
  const { data } = useGetDHCPProfileQuery({ params })
  // const [
  //   saveDHCP
  // ] = useSaveDHCPMutation()

  const [saveState, updateSaveState] = useState<DHCPSaveData>({
    serviceName: '',
    dhcpMode: DHCPConfigTypeEnum.SIMPLE,
    venueIds: [],
    dhcpPools: []
  })

  const updateSaveData = (saveData: Partial<DHCPSaveData>) => {
    updateSaveState({ ...saveState, ...saveData })
  }

  useEffect(() => {
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
        title={editMode ? $t({ defaultMessage: 'Edit DHCP Service' }) :
          $t({ defaultMessage: 'Add DHCP for Wi-Fi Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Service' }), link: '/services' }
        ]}
      />

      <DHCPFormContext.Provider value={{ editMode, saveState, updateSaveState }}>
        <StepsForm<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToServices)}
          onFinish={
            // editMode ? handleEditDHCP : handleAddDHCP
            async ()=>{
              if(locationState.origin){
                navigate(locationState.origin.pathname, { state: locationState.param })
              }
            }
          }
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'DHCP Settings' })}
            onFinish={async data => {
              updateSaveData(data)
              return true
            }}
          >
            <SettingForm />
          </StepsForm.StepForm>


          <StepsForm.StepForm
            name='venues'
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={async (data) => {
              updateSaveData(data)
              return true
            }}
          >
            <Venues />
          </StepsForm.StepForm>

          {!editMode &&
          <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
            <SummaryForm summaryData={saveState}/>
          </StepsForm.StepForm>
          }
        </StepsForm>
      </DHCPFormContext.Provider>
    </>
  )
}
