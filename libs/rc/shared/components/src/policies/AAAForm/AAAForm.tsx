import { useRef, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }      from '@acx-ui/feature-toggle'
import {
  useAaaPolicyQuery,
  useAddAAAPolicyMutation,
  useUpdateAAAPolicyMutation,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation
} from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  usePolicyPageHeaderTitle,
  PolicyOperation,
  PolicyType,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  usePolicyListBreadcrumb,
  usePolicyPreviousPath
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
  const enableRbac = useIsSplitOn(Features.ACX_UI_RBAC_SERVICE_POLICY_TOGGLE)
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
      } else {
        await createInstance(requestPayload).unwrap().then(res => data.id = res?.response?.id)
      }
      networkView ? backToNetwork?.(data) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    networkView ? backToNetwork?.() : navigate(linkToInstanceList)
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
