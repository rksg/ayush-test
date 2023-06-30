import { useReducer } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { useAddRoguePolicyMutation, useUpdateRoguePolicyMutation } from '@acx-ui/rc/services'
import {
  RogueAPDetectionContextType,
  RogueAPRule,
  RogueVenue,
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation, CommonResult
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

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
  const { $t } = useIntl()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const tablePath = getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const { edit, modalMode, modalCallBack } = props
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const form = Form.useFormInstance()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName: '',
    tags: [] as string[],
    description: '',
    rules: [] as RogueAPRule[],
    venues: [] as RogueVenue[]
  })

  const [ createRoguePolicy ] = useAddRoguePolicyMutation()

  const [ updateRoguePolicy ] = useUpdateRoguePolicyMutation()

  const transformPayload = (state: RogueAPDetectionContextType, edit: boolean) => {
    return {
      id: edit ? params.policyId : '',
      name: state.policyName,
      description: state.description,
      rules: state.rules,
      venues: state.venues
    }
  }

  const handleRogueAPDetectionPolicy = async (edit: boolean) => {
    try {
      let results = {} as CommonResult
      if (!edit) {
        results = await createRoguePolicy({
          params,
          payload: transformPayload(state, false)
        }).unwrap()
      } else {
        await updateRoguePolicy({
          params,
          payload: transformPayload(state, true)
        }).unwrap()
      }
      const response = results.response as { id: string }
      modalMode ? modalCallBack?.(response.id) : navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <RogueAPDetectionContext.Provider value={{ state, dispatch }}>
      {!modalMode && <PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit Rogue AP Detection Policy' })
          : $t({ defaultMessage: 'Add Rogue AP Detection Policy' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'Policies & Profiles' }) },
          { text: $t({ defaultMessage: 'Rogue AP Detection' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Rogue AP Detection' }), link: tablePath }
        ]}
      />}
      <StepsForm<RogueAPDetectionContextType>
        form={form}
        editMode={edit}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToPolicies, { replace: true })}
        onFinish={() => handleRogueAPDetectionPolicy(edit)}
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
