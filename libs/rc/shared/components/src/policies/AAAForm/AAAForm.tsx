import { useRef, useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useAaaPolicyQuery,
  useAddAAAPolicyMutation,
  useUpdateAAAPolicyMutation,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation,
  useActivateCertificateAuthorityOnRadiusMutation,
  useActivateCertificateOnRadiusMutation,
  useDeactivateCertificateOnRadiusMutation
} from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  usePolicyPageHeaderTitle,
  PolicyOperation,
  PolicyType,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  usePolicyListBreadcrumb,
  usePolicyPreviousPath,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import { AAASettingForm } from './AAASettingForm'


type AAAFormProps = {
  type?: string,
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: AAAPolicyType) => void
}
export const AAAForm = (props: AAAFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.AAA, PolicyOperation.LIST)
  const params = useParams()
  const { type, edit, networkView, backToNetwork } = props
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<AAAPolicyType>>()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.AAA)
  const pageTitle = usePolicyPageHeaderTitle(isEdit, PolicyType.AAA)
  const { isTemplate } = useConfigTemplate()
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const addCertificateActivations = useAddCertificateActivations()
  const updateCertificateActivations = useUpdateCertificateActivations()
  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useAaaPolicyQuery,
    useTemplateQueryFn: useGetAAAPolicyTemplateQuery,
    skip: !isEdit,
    enableRbac
  })

  const [ createInstance ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddAAAPolicyMutation,
    useTemplateMutationFn: useAddAAAPolicyTemplateMutation
  })
  const [ updateInstance ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateAAAPolicyMutation,
    useTemplateMutationFn: useUpdateAAAPolicyTemplateMutation
  })
  const [saveState, setSaveState] = useState<AAAPolicyType>({ name: '' })

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      setSaveState({ ...saveState, ...data })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAAAPolicy = async (data: AAAPolicyType) => {
    const requestPayload = { params, payload: data, enableRbac }
    try {
      if (isEdit) {
        await updateInstance(requestPayload).unwrap()
        if (supportRadsec) {
          updateCertificateActivations(data, data.id)
        }
      } else {
        await createInstance(requestPayload).unwrap().then(res => {
          data.id = res?.response?.id
          if (supportRadsec) {
            addCertificateActivations(data, res?.response?.id)
          }
        })
      }

      networkView ? backToNetwork?.(data) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    networkView ? backToNetwork?.() : navigate(linkToInstanceList)
  }

  function useCertificateAuthorityActivation () {
    const [activate] = useActivateCertificateAuthorityOnRadiusMutation()
    const activateCertificateAuthority =
      async (radiusId?: string, certificateAuthorityId?: string) => {
        return radiusId && certificateAuthorityId ?
          await activate({ params: { radiusId, certificateAuthorityId } }).unwrap() : null
      }
    return activateCertificateAuthority
  }

  function useCertificateActivation () {
    const [activate] = useActivateCertificateOnRadiusMutation()
    const activateCertificate =
      async (radiusId?: string, certificateId?: string) => {
        return radiusId && certificateId ?
          await activate({ params: { radiusId, certificateId } }).unwrap() : null
      }
    return activateCertificate
  }

  function useCertificateDeactivation () {
    const [deactivate] = useDeactivateCertificateOnRadiusMutation()
    const deactivateCertificate =
      async (radiusId?: string, certificateId?: string) => {
        return radiusId && certificateId ?
          await deactivate({ params: { radiusId, certificateId } }).unwrap() : null
      }
    return deactivateCertificate
  }

  function useAddCertificateActivations () {
    const activateCertificateAuthority = useCertificateAuthorityActivation()
    const activateCertificate = useCertificateActivation()
    const addCertificateActivations =
      async (aaa?: AAAPolicyType, radiusId?: string) => {
        const radSecOptions = aaa?.radSecOptions

        await activateCertificateAuthority(radiusId, aaa?.radSecOptions?.clientCertificateId)
        if (!_.isEmpty(radSecOptions?.clientCertificateId)) {
          await activateCertificate(radiusId, aaa?.radSecOptions?.clientCertificateId)
        }
      }
    return addCertificateActivations
  }

  function useUpdateCertificateActivations () {
    const activateCertificateAuthority = useCertificateAuthorityActivation()
    const activateCertificate = useCertificateActivation()
    const deactivateCertificate = useCertificateDeactivation()
    const addCertificateActivations =
      async (aaa?: AAAPolicyType, radiusId?: string) => {
        const radSecOptions = aaa?.radSecOptions

        if (radSecOptions?.originalCertificateAuthorityId &&
          radSecOptions?.originalCertificateAuthorityId !== radSecOptions?.certificateAuthorityId) {
          await activateCertificateAuthority(radiusId, aaa?.radSecOptions?.clientCertificateId)
        }
        if (radSecOptions?.originalClientCertificateId &&
          radSecOptions?.originalClientCertificateId !== radSecOptions?.clientCertificateId) {
          if (!_.isEmpty(radSecOptions?.clientCertificateId)) {
            await activateCertificate(radiusId, aaa?.radSecOptions?.clientCertificateId)
          } else {
            await deactivateCertificate(radiusId, aaa?.radSecOptions?.clientCertificateId)
          }
        }
      }
    return addCertificateActivations
  }

  return (
    <>
      {!networkView && <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<AAAPolicyType>
        formRef={formRef}
        onCancel={onCancel}
        onFinish={handleAAAPolicy}
        editMode={isEdit}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={isEdit}
            saveState={saveState}
            type={type}
            networkView={networkView}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
