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
import { useGetDHCPProfileQuery, useSaveOrUpdateDHCPMutation }              from '@acx-ui/rc/services'
import { DHCPSaveData, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useParams, useTenantLink, useNavigate, useLocation }               from '@acx-ui/react-router-dom'

import { SettingForm } from './DHCPSettingForm'

export const DEFAULT_GUEST_DHCP_NAME = 'DHCP-Guest'

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
  const linkToServices = useTenantLink('/services/dhcp/list')

  const {
    data,
    isFetching,
    isLoading
  } = useGetDHCPProfileQuery({ params }, { skip: !editMode })

  const [
    saveOrUpdateDHCP,
    { isLoading: isFormSubmitting }
  ] = useSaveOrUpdateDHCPMutation()


  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
    }
  }, [data])

  const handleAddOrUpdateDHCP = async (formData: DHCPSaveData) => {
    try {
      convertLeashTimeforBackend(formData)
      const payload = {
        ...formData,
        dhcpPools: formData.dhcpPools.map((pool)=>{
          return {
            ...pool,
            id: pool.id.indexOf('_NEW_')!==-1 ? '' : pool.id
          }
        })
      }
      await saveOrUpdateDHCP({ params, payload }).unwrap()
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
          {
            text: $t({ defaultMessage: 'Services' }),
            link: getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })
          }
        ]}
      />
      <Loader states={[{ isLoading: isLoading || isFormSubmitting, isFetching: isFetching }]}>
        <StepsForm<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToServices)}
          onFinish={
            async (data)=>{
              await handleAddOrUpdateDHCP(data)
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
            <SettingForm editMode={editMode}/>
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}
