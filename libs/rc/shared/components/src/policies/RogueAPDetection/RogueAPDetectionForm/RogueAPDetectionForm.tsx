import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import {
  useAddRoguePolicyMutation,
  useAddRoguePolicyTemplateMutation,
  useUpdateRoguePolicyMutation,
  useUpdateRoguePolicyTemplateMutation
} from '@acx-ui/rc/services'
import {
  RogueAPDetectionContextType,
  RogueAPRule,
  RogueVenue,
  PolicyType,
  PolicyOperation,
  CommonResult,
  usePolicyListBreadcrumb,
  usePolicyPageHeaderTitle,
  useConfigTemplateMutationFnSwitcher,
  usePolicyPreviousPath,
  RoguePolicyRequest, useConfigTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams } from '@acx-ui/react-router-dom'

import RogueAPDetectionContext , { mainReducer } from '../RogueAPDetectionContext'
import { RogueAPDetectionScopeForm }             from '../RogueAPDetectionScope/RogueAPDetectionScopeForm'
import { RogueAPDetectionSummaryForm }           from '../RogueAPDetectionSummary/RogueAPDetectionSummaryForm'

import { RogueAPDetectionSettingForm } from './RogueAPDetectionSettingForm'

type RogueAPDetectionFormProps = {
  edit: boolean,
  modalMode?: boolean,
  modalCallBack?: (id?: string) => void
}

export const RogueAPDetectionForm = (props: RogueAPDetectionFormProps) => {
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const linkToInstanceList = usePolicyPreviousPath(PolicyType.ROGUE_AP_DETECTION, PolicyOperation.LIST)
  const params = useParams()
  const { edit, modalMode, modalCallBack } = props

  const form = Form.useFormInstance()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName: '',
    tags: [] as string[],
    description: '',
    rules: [] as RogueAPRule[],
    venues: [] as RogueVenue[],
    defaultPolicyId: ''
  })

  const [ createRoguePolicy ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useAddRoguePolicyMutation,
    useTemplateMutationFn: useAddRoguePolicyTemplateMutation
  })

  const [ updateRoguePolicy ] = useConfigTemplateMutationFnSwitcher({
    useMutationFn: useUpdateRoguePolicyMutation,
    useTemplateMutationFn: useUpdateRoguePolicyTemplateMutation
  })

  // eslint-disable-next-line max-len
  const transformPayload = (state: RogueAPDetectionContextType, edit: boolean) : RoguePolicyRequest => {
    return {
      id: edit ? params.policyId : '',
      name: state.policyName,
      description: state.description,
      rules: state.rules,
      venues: state.venues,
      oldVenues: state.oldVenues || [],
      defaultPolicyId: state.defaultPolicyId ?? ''
    }
  }

  const handleRogueAPDetectionPolicy = async () => {
    try {
      let results = {} as CommonResult
      if (!edit) {
        results = await createRoguePolicy({
          params,
          payload: transformPayload(state, false),
          enableRbac: (isTemplate) ? enableTemplateRbac : enableRbac
        }).unwrap()
      } else {
        await updateRoguePolicy({
          params,
          payload: transformPayload(state, true),
          enableRbac: (isTemplate) ? enableTemplateRbac : enableRbac
        }).unwrap()
      }
      const response = results.response as { id: string }
      modalMode ? modalCallBack?.(response.id) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    modalMode ? modalCallBack?.() : navigate(linkToInstanceList, { replace: true })
  }

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.ROGUE_AP_DETECTION)
  const pageTitle = usePolicyPageHeaderTitle(edit, PolicyType.ROGUE_AP_DETECTION)

  return (
    <RogueAPDetectionContext.Provider value={{ state, dispatch }}>
      {!modalMode && <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />}
      <StepsForm<RogueAPDetectionContextType>
        form={form}
        editMode={edit}
        onCancel={onCancel}
        onFinish={handleRogueAPDetectionPolicy}
      >
        <StepsForm.StepForm<RogueAPDetectionContextType>
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <RogueAPDetectionSettingForm edit={edit}/>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='scope'
          title={$t({ defaultMessage: 'Scope' })}
        >
          <RogueAPDetectionScopeForm />
        </StepsForm.StepForm>

        { !edit && <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <RogueAPDetectionSummaryForm />
        </StepsForm.StepForm> }
      </StepsForm>
    </RogueAPDetectionContext.Provider>
  )
}
