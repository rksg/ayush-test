import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance,
  showToast,
  Loader
} from '@acx-ui/components'
import { useGetDHCPProfileQuery, useSaveOrUpdateDHCPMutation } from '@acx-ui/rc/services'
import { DHCPSaveData }                                        from '@acx-ui/rc/utils'
import { useParams, useTenantLink, useNavigate, useLocation }  from '@acx-ui/react-router-dom'

import { SettingForm } from './DHCPSettingForm'

interface DHCPFormProps {
  editMode?: boolean
}

export default function DHCPForm (props: DHCPFormProps) {
  const { $t } = useIntl()

  const params = useParams()
  type LocationState = {
    origin: { pathname: string },
    param: object
  }
  const locationState:LocationState = useLocation().state as LocationState

  const { editMode } = props

  const formRef = useRef<StepsFormInstance<DHCPSaveData>>()

  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')

  const {
    data,
    isLoading
  } = useGetDHCPProfileQuery({ params }, { skip: !editMode })

  const [
    saveOrUpdateDHCP
  ] = useSaveOrUpdateDHCPMutation()


  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAddOrUpdateDHCP = async (formData: DHCPSaveData) => {
    try {
      convertLeashTimeforBackend(formData)
      await saveOrUpdateDHCP({ params, payload: formData }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const convertLeashTimeforBackend = (data: DHCPSaveData) => {
    _.each(data.dhcpPools, (pool, index) => {
      pool.leaseTimeMinutes = 0
      pool.leaseTimeHours = 0
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
      <Loader states={[{ isLoading: isLoading }]}>
        <StepsForm<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToServices)}
          onFinish={
            async (data)=>{
              handleAddOrUpdateDHCP(data)
              if(locationState?.origin){
                navigate(locationState.origin.pathname, { state: locationState.param })
              }else{
                navigate(linkToServices, { replace: true })
              }
            }
          }
        >
          <StepsForm.StepForm
            name='settings'
            title={$t({ defaultMessage: 'DHCP Settings' })}
          >
            <SettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}
