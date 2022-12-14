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
    isFetching,
    isLoading
  } = useGetDHCPProfileQuery({ params })

  const [
    saveOrUpdateDHCP,
    { isLoading: isFormSubmitting }
  ] = useSaveOrUpdateDHCPMutation()


  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAddOrUpdateDHCP = async (data: DHCPSaveData) => {
    try {
      convertLeashTimeforBackend(data)
      const payload = editMode ? _.omit(data, 'id') : data
      await saveOrUpdateDHCP({ params: { tenantId: params.tenantId }, payload }).unwrap()
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
      <Loader states={[{ isLoading: isLoading || isFormSubmitting, isFetching: isFetching }]}>
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
