import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                    from '@acx-ui/feature-toggle'
import { useGetDHCPProfileQuery, useSaveOrUpdateDHCPMutation }                                       from '@acx-ui/rc/services'
import { DHCPSaveData, getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useParams, useTenantLink, useNavigate, useLocation }                                        from '@acx-ui/react-router-dom'

import { SettingForm } from './DHCPSettingForm'

export const DEFAULT_GUEST_DHCP_NAME = 'DHCP-Guest'

interface DHCPFormProps {
  editMode?: boolean
}

export default function DHCPForm (props: DHCPFormProps) {
  const { $t } = useIntl()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const params = useParams()
  type LocationState = {
    origin: { pathname: string },
    param: object
  }
  const locationState:LocationState = useLocation().state as LocationState

  const { editMode } = props

  const formRef = useRef<StepsFormLegacyInstance<DHCPSaveData>>()

  const navigate = useNavigate()
  const tablePath = getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })
  const linkToServices = useTenantLink(tablePath)
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
          delete pool.allowWired
          return {
            ...pool,
            id: pool.id.indexOf('_NEW_')!==-1 ? '' : pool.id
          }
        })
      }
      await saveOrUpdateDHCP({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const convertLeashTimeforBackend = (data: DHCPSaveData) => {
    _.each(data.dhcpPools, (pool, index) => {
      pool.leaseTimeMinutes = 0
      pool.leaseTimeHours = 0
      if(pool.leaseTime&&pool.leaseTime>=60){
        pool.leaseTimeHours=Math.floor(pool.leaseTime/60)
        pool.leaseTimeMinutes=pool.leaseTime%60
      }
      else if(pool.leaseUnit) pool[pool.leaseUnit] = pool.leaseTime
      data.dhcpPools[index] = _.omit(pool, 'leaseUnit', 'leaseTime')
    })
  }


  return (
    <>
      <PageHeader
        title={editMode ? $t({ defaultMessage: 'Edit DHCP Service' }) :
          $t({ defaultMessage: 'Add DHCP for Wi-Fi Service' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'DHCP' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'DHCP Services' }), link: tablePath }
        ]}
      />
      <Loader states={[{ isLoading: isLoading || isFormSubmitting, isFetching: isFetching }]}>
        <StepsFormLegacy<DHCPSaveData>
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
          <StepsFormLegacy.StepForm
            name='settings'
            title={$t({ defaultMessage: 'DHCP Settings' })}
          >
            <SettingForm editMode={editMode}/>
          </StepsFormLegacy.StepForm>
        </StepsFormLegacy>
      </Loader>
    </>
  )
}
