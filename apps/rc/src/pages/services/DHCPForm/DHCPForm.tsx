import { useState, useRef, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance,
  showToast } from '@acx-ui/components'
import { useGetDHCPQuery, useSaveDHCPMutation }  from '@acx-ui/rc/services'
import { DHCPSaveData, DHCPConfigTypeEnum }      from '@acx-ui/rc/utils'
import { useParams, useTenantLink, useNavigate } from '@acx-ui/react-router-dom'

import DHCPFormContext from './DHCPFormContext'
import { SettingForm } from './SettingForm'
import { SummaryForm } from './Summary/SummaryForm'
import { Venues }      from './Venues/Venues'

export function DHCPForm () {
  const { $t } = useIntl()

  const params = useParams()

  const editMode = params.action === 'edit'

  const formRef = useRef<StepsFormInstance<DHCPSaveData>>()

  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')


  //WIFI OR Switch
  // const [technologyType, useTechnologyType] = useState<ServiceTechnology>(ServiceTechnology.WIFI)

  //simple, multiple...
  // const [dhcpConfigType, setDHCPConfigType] = useState<DHCPConfigTypeEnum | undefined>()

  //API Call
  const [data, updateData] = useState<DHCPSaveData>({
    name: '',
    tags: [],
    dhcpConfig: DHCPConfigTypeEnum.SIMPLE,
    venues: [],
    dhcpPools: []
  })
  const [
    saveDHCP
  ] = useSaveDHCPMutation()

  const [saveState, updateSaveState] = useState<DHCPSaveData>({
    name: '',
    tags: [],
    dhcpConfig: DHCPConfigTypeEnum.SIMPLE,
    venues: [],
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

  const handleAddDHCP = async () => {
    try {
      // await saveDHCP({ params, payload: saveState }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditDHCP = async () => {
    try {
      // await updateDHCP({ params, payload: saveState }).unwrap()
      // navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: 'Edit DHCP Service' }) :
          params.type === 'wifi' ?
            $t({ defaultMessage: 'Add DHCP for Wi-Fi Service' }) :
            $t({ defaultMessage: 'Add DHCP for Switch Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Service' }), link: '/services' }
        ]}
      />

      <DHCPFormContext.Provider value={{ editMode, data, updateData }}>
        <StepsForm<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToServices)}
          onFinish={editMode ? handleEditDHCP : handleAddDHCP}
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
            // initialValues={data}
            // params={data}
            // request={(params) => {
            //   return Promise.resolve({
            //     data: params,
            //     success: true
            //   })
            // }}
            name='venues'
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={async (data) => {
              updateSaveData(data)
              return true
            }}
          >
            <Venues />
          </StepsForm.StepForm>

          <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
            <SummaryForm summaryData={saveState}/>
          </StepsForm.StepForm>

        </StepsForm>
      </DHCPFormContext.Provider>
    </>
  )
}
