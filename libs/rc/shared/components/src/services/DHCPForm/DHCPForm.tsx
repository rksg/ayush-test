import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Loader
} from '@acx-ui/components'
import { useCreateOrUpdateDhcpTemplateMutation, useGetDHCPProfileQuery, useGetDhcpTemplateQuery, useSaveOrUpdateDHCPMutation } from '@acx-ui/rc/services'
import {
  DHCPSaveData,
  generateServicePageHeaderTitle,
  ServiceOperation, ServiceType,
  useConfigTemplate, useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher, useServiceListBreadcrumb,
  useServicePreviousPath
} from '@acx-ui/rc/utils'
import { useParams, useNavigate, useLocation } from '@acx-ui/react-router-dom'

import { SettingForm } from './DHCPSettingForm'

export const DEFAULT_GUEST_DHCP_NAME = 'DHCP-Guest'

interface DHCPFormProps {
  editMode?: boolean
}

type LocationState = {
  origin: { pathname: string },
  param: object
}

export function DHCPForm (props: DHCPFormProps) {
  const { $t } = useIntl()

  const params = useParams()

  const locationState:LocationState = useLocation().state as LocationState

  const { editMode = false } = props

  const formRef = useRef<StepsFormLegacyInstance<DHCPSaveData>>()

  const navigate = useNavigate()
  const linkToInstances = useServicePreviousPath(ServiceType.DHCP, ServiceOperation.LIST)
  // eslint-disable-next-line max-len
  const { data, isLoading, isFetching } = useConfigTemplateQueryFnSwitcher<DHCPSaveData | null>(
    useGetDHCPProfileQuery, useGetDhcpTemplateQuery, !editMode
  )

  const [ saveOrUpdateDHCP, { isLoading: isFormSubmitting } ] = useConfigTemplateMutationFnSwitcher(
    useSaveOrUpdateDHCPMutation, useCreateOrUpdateDhcpTemplateMutation
  )

  const { isTemplate } = useConfigTemplate()
  const breadcrumb = useServiceListBreadcrumb(ServiceType.DHCP)


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
        title={generateServicePageHeaderTitle(editMode, isTemplate, ServiceType.DHCP)}
        breadcrumb={breadcrumb}
      />
      <Loader states={[{ isLoading: isLoading || isFormSubmitting, isFetching: isFetching }]}>
        <StepsFormLegacy<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToInstances)}
          onFinish={
            async (data)=>{
              await handleAddOrUpdateDHCP(data)
              if(locationState?.origin){
                navigate(locationState.origin.pathname, { state: locationState.param })
              }else{
                navigate(linkToInstances, { replace: true })
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
