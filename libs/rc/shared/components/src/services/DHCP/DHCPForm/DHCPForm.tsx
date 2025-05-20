import { useRef, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                              from '@acx-ui/feature-toggle'
import { useCreateOrUpdateDhcpTemplateMutation, useGetDHCPProfileQuery, useGetDhcpTemplateQuery, useSaveOrUpdateDHCPMutation } from '@acx-ui/rc/services'
import {
  DHCPSaveData,
  useServicePageHeaderTitle,
  ServiceOperation, ServiceType,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher, useServiceListBreadcrumb,
  useServicePreviousPath,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams, useNavigate } from '@acx-ui/react-router-dom'

import { SettingForm } from './DHCPSettingForm'

export const DEFAULT_GUEST_DHCP_NAME = 'DHCP-Guest'

interface DHCPFormProps {
  editMode?: boolean
}

export function DHCPForm (props: DHCPFormProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { editMode = false } = props
  const formRef = useRef<StepsFormLegacyInstance<DHCPSaveData>>()
  const navigate = useNavigate()
  const { isTemplate } = useConfigTemplate()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
  // eslint-disable-next-line max-len
  const { pathname: previousPath, returnParams } = useServicePreviousPath(ServiceType.DHCP, ServiceOperation.LIST)

  const { data, isLoading, isFetching } = useConfigTemplateQueryFnSwitcher<DHCPSaveData | null>({
    useQueryFn: useGetDHCPProfileQuery,
    useTemplateQueryFn: useGetDhcpTemplateQuery,
    skip: !editMode,
    enableRbac
  })

  // eslint-disable-next-line max-len
  const [ saveOrUpdateDHCP, { isLoading: isFormSubmitting } ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useSaveOrUpdateDHCPMutation,
    useTemplateMutationFn: useCreateOrUpdateDhcpTemplateMutation
  })

  const breadcrumb = useServiceListBreadcrumb(ServiceType.DHCP)
  const pageTitle = useServicePageHeaderTitle(editMode, ServiceType.DHCP)

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
        dhcpPools: formData.dhcpPools.map(({ id, allowWired, ...pool })=>{
          return {
            ...pool,
            ...(id.indexOf('_NEW_')!==-1 || resolvedEnableRbac) ? {} : { id }
          }
        })
      }
      await saveOrUpdateDHCP({ params, payload, enableRbac: resolvedEnableRbac }).unwrap()

      navigateToPreviousPage(true)
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

  const navigateToPreviousPage = (replaceCurrentPath = false) => {
    navigate(previousPath, {
      replace: replaceCurrentPath,
      ...(returnParams ? { state: { from: { returnParams } } } : {})
    })
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <Loader states={[{ isLoading: isLoading || isFormSubmitting, isFetching: isFetching }]}>
        <StepsFormLegacy<DHCPSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={navigateToPreviousPage}
          onFinish={handleAddOrUpdateDHCP}
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
