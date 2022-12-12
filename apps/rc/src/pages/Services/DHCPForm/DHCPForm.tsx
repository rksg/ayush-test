import { useState, useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance,
  showToast
} from '@acx-ui/components'
import { useGetDHCPProfileQuery, useSaveOrUpdateDHCPMutation } from '@acx-ui/rc/services'
import { DHCPSaveData, DHCPConfigTypeEnum }                    from '@acx-ui/rc/utils'
import { useParams, useTenantLink, useNavigate, useLocation }  from '@acx-ui/react-router-dom'

import DHCPFormContext from './DHCPFormContext'
import { SettingForm } from './DHCPSettingForm'

export default function DHCPForm () {
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
  const [
    saveOrUpdateDHCP
  ] = useSaveOrUpdateDHCPMutation()

  const [saveState, updateSaveState] = useState<DHCPSaveData>({
    serviceName: '',
    dhcpMode: DHCPConfigTypeEnum.SIMPLE,
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

  const handleAddOrUpdateDHCP = async (data: DHCPSaveData) => {
    try {
      convertLeashTimeforBackend(data)
      const payload = editMode ? _.omit(data, 'id') : data
      await saveOrUpdateDHCP({ params: { tenantId: params.tenantId }, payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const convertLeashTimeforBackend = (data: DHCPSaveData) => {
    _.each(data.dhcpPools, (pool, index) => {
      if(pool.leaseUnit) pool[pool.leaseUnit] = pool.leaseTime
      data.dhcpPools[index] = _.omit(pool, 'leaseUnit', 'leaseTime')
    })
  }


  return (
    <>
      <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit DHCP Service' }) :
          $t({ defaultMessage: 'Add DHCP for Wi-Fi Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />

      <DHCPFormContext.Provider value={{ editMode, saveState, updateSaveState }}>
        <StepsForm<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToServices)}
          onFinish={
            async (data)=>{
              handleAddOrUpdateDHCP(data)

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
        </StepsForm>
      </DHCPFormContext.Provider>
    </>
  )
}
