import { useRef, useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  showActionModal,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useAaaPolicyQuery,
  useAddAAAPolicyMutation,
  useUpdateAAAPolicyMutation,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation,
  useActivateCertificateAuthorityOnRadiusMutation,
  useActivateClientCertificateOnRadiusMutation,
  useDeactivateClientCertificateOnRadiusMutation,
  useActivateServerCertificateOnRadiusMutation,
  useDeactivateServerCertificateOnRadiusMutation,
  useAaaPolicyCertificateQuery
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
  useConfigTemplate,
  ConfigTemplateType
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { useEnforcedStatus } from '../../configTemplates'

import { AAASettingForm } from './AAASettingForm'


type AAAFormProps = {
  type?: string,
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: AAAPolicyType) => void,
  forceDisableRadsec?: boolean
}

type State = {
  networkIds?: string[]
}
export const AAAForm = (props: AAAFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.AAA, PolicyOperation.LIST)
  const params = useParams()
  const state = useLocation().state as State
  const { type, edit, networkView, backToNetwork, forceDisableRadsec } = props
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<AAAPolicyType>>()
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.AAA)
  const pageTitle = usePolicyPageHeaderTitle(isEdit, PolicyType.AAA)
  const { isTemplate, saveEnforcementConfig } = useConfigTemplate()
  const { getEnforcedStepsFormProps } = useEnforcedStatus(ConfigTemplateType.RADIUS)
  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const addRadSecActivations = useAddRadSecActivations()
  const updateRadSecActivations = useUpdateRadSecActivations()
  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: supportRadsec ? useAaaPolicyCertificateQuery : useAaaPolicyQuery,
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
    if (!_.isEmpty(state?.networkIds)) {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Configuration Changes' }),
        content: $t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Modifying RADIUS settings on an active network assignment may impact the networks associated with this profile. Please review the configuration carefully to ensure they are correctly set. Are you sure you would like to continue?'
        }),
        onOk: async () => {
          await saveAAAPolicy(data)
        }
      })
    } else {
      await saveAAAPolicy(data)
    }
  }

  const saveAAAPolicy = async (data: AAAPolicyType) => {
    const requestPayload = { params, payload: handledRadSecData(data), enableRbac }
    let entityId: string | undefined

    try {
      if (isEdit) {
        const res = await updateInstance(requestPayload).unwrap()
        if (supportRadsec) {
          updateRadSecActivations(data, requestPayload?.params?.policyId)
        }
        entityId = res.id
      } else {
        await createInstance(requestPayload).unwrap().then(res => {
          entityId = res?.response?.id
          data.id = res?.response?.id
          if (supportRadsec) {
            addRadSecActivations(data, res?.response?.id)
          }
        })
      }

      if (entityId) {
        await saveEnforcementConfig(entityId)
      }

      networkView ? backToNetwork?.(data) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handledRadSecData = (data: AAAPolicyType) => {
    let cloneData = _.cloneDeep(_.omit(data,
      'radSecOptions.ocspValidationEnabled',
      'radSecOptions.originalCertificateAuthorityId',
      'radSecOptions.originalClientCertificateId',
      'radSecOptions.originalServerCertificateId'
    ))
    if (cloneData.radSecOptions?.ocspUrl) {
      cloneData.radSecOptions.ocspUrl = `http://${cloneData.radSecOptions.ocspUrl}`
    }
    return cloneData
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

  function useClientCertificateActivation () {
    const [activate] = useActivateClientCertificateOnRadiusMutation()
    const activateClientCertificate =
      async (radiusId?: string, clientCertificateId?: string) => {
        return radiusId && clientCertificateId ?
          await activate({ params: { radiusId, clientCertificateId } }).unwrap() : null
      }
    return activateClientCertificate
  }

  function useClientCertificateDeactivation () {
    const [deactivate] = useDeactivateClientCertificateOnRadiusMutation()
    const deactivateClientCertificate =
      async (radiusId?: string, clientCertificateId?: string) => {
        return radiusId && clientCertificateId ?
          await deactivate({ params: { radiusId, clientCertificateId } }).unwrap() : null
      }
    return deactivateClientCertificate
  }

  function useServerCertificateActivation () {
    const [activate] = useActivateServerCertificateOnRadiusMutation()
    const activateServerCertificate =
      async (radiusId?: string, serverCertificateId?: string) => {
        return radiusId && serverCertificateId ?
          await activate({ params: { radiusId, serverCertificateId } }).unwrap() : null
      }
    return activateServerCertificate
  }

  function useServerCertificateDeactivation () {
    const [deactivate] = useDeactivateServerCertificateOnRadiusMutation()
    const deactivateServerCertificate =
      async (radiusId?: string, serverCertificateId?: string) => {
        return radiusId && serverCertificateId ?
          await deactivate({ params: { radiusId, serverCertificateId } }).unwrap() : null
      }
    return deactivateServerCertificate
  }

  function useAddRadSecActivations () {
    const activateCertificateAuthority = useCertificateAuthorityActivation()
    const activateClientCertificate = useClientCertificateActivation()
    const activateServerCertificate = useServerCertificateActivation()
    const addRadSecActivations =
      async (aaa?: AAAPolicyType, radiusId?: string) => {
        const radSecOptions = aaa?.radSecOptions

        await activateCertificateAuthority(radiusId, radSecOptions?.certificateAuthorityId)
        if (radSecOptions?.clientCertificateId) {
          await activateClientCertificate(radiusId, radSecOptions?.clientCertificateId)
        }
        if (radSecOptions?.serverCertificateId) {
          await activateServerCertificate(radiusId, radSecOptions?.serverCertificateId)
        }
      }
    return addRadSecActivations
  }

  function useUpdateRadSecActivations () {
    const activateCertificateAuthority = useCertificateAuthorityActivation()
    const activateClientCertificate = useClientCertificateActivation()
    const deactivateClientCertificate = useClientCertificateDeactivation()
    const activateServerCertificate = useServerCertificateActivation()
    const deactivateServerCertificate = useServerCertificateDeactivation()
    const addRadSecActivations =
      async (aaa?: AAAPolicyType, radiusId?: string) => {
        const radSecOptions = aaa?.radSecOptions

        if (radSecOptions?.originalCertificateAuthorityId
          !== radSecOptions?.certificateAuthorityId) {
          await activateCertificateAuthority(radiusId, radSecOptions?.certificateAuthorityId)
        }
        if (radSecOptions?.originalClientCertificateId !== radSecOptions?.clientCertificateId) {
          if (radSecOptions?.clientCertificateId) {
            await activateClientCertificate(radiusId, radSecOptions?.clientCertificateId)
          } else if (radSecOptions?.originalClientCertificateId) {
            await deactivateClientCertificate(
              radiusId, radSecOptions?.originalClientCertificateId)
          }
        }
        if (radSecOptions?.originalServerCertificateId !== radSecOptions?.serverCertificateId) {
          if (radSecOptions?.serverCertificateId) {
            await activateServerCertificate(radiusId, radSecOptions?.serverCertificateId)
          } else if (radSecOptions?.originalServerCertificateId) {
            await deactivateServerCertificate(
              radiusId, radSecOptions?.originalServerCertificateId)
          }
        }
      }
    return addRadSecActivations
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
        {...getEnforcedStepsFormProps('StepsFormLegacy')}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={isEdit}
            saveState={saveState}
            type={type}
            networkView={networkView}
            forceDisableRadsec={forceDisableRadsec}
          />
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
