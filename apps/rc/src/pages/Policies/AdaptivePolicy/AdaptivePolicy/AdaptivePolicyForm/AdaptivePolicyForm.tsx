import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddAdaptivePolicyMutation, useAddPolicyConditionsMutation,
  useGetAdaptivePolicyQuery, useGetConditionsInPolicyQuery,
  useUpdateAdaptivePolicyMutation
} from '@acx-ui/rc/services'
import { AccessCondition, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                    from '@acx-ui/react-router-dom'

import { AdaptivePolicySettingForm } from './AdaptivePolicySettingForm'

interface AdaptivePolicyFormProps {
  editMode?: boolean
}

export default function AdaptivePolicyForm (props: AdaptivePolicyFormProps) {
  const { $t } = useIntl()
  const { editMode = false } = props
  const { policyId, templateId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance>()
  const [addAdaptivePolicy] = useAddAdaptivePolicyMutation()
  const [addConditions] = useAddPolicyConditionsMutation()

  const [updateAdaptivePolicy, { isLoading: isUpdating }] = useUpdateAdaptivePolicyMutation()

  // eslint-disable-next-line max-len
  const { data, isLoading: isGetPolicyLoading } = useGetAdaptivePolicyQuery({ params: { policyId, templateId } }, { skip: !editMode })
  // eslint-disable-next-line max-len
  const { data: conditionsData, isLoading: isGetConditionsLoading } = useGetConditionsInPolicyQuery({
    payload: { page: '1', pageSize: '2147483647' },
    params: { policyId, templateId } }, { skip: !editMode })

  useEffect(() => {
    if(data && editMode) {
      formRef.current?.setFieldsValue({
        ...data,
        templateTypeId: Number(templateId)
      })
    }
  }, [data, editMode])

  useEffect(() =>{
    if(conditionsData && editMode) {
      formRef.current?.setFieldValue('evaluationRules', conditionsData.data)
    }
  }, [conditionsData, editMode])

  const handleSubmit = async () => {
    const data = formRef.current?.getFieldsValue()
    try {
      const policyPayload = {
        name: data.name,
        onMatchResponse: 'testResponse'
      }

      if(editMode){
        await updateAdaptivePolicy({
          params: { templateId: data.templateTypeId },
          payload: policyPayload
        }).unwrap()

      } else {
        await addAdaptivePolicy({
          params: { templateId: data.templateTypeId },
          payload: policyPayload
        }).unwrap()
        // no policyId
        const policyId = ''
        data.evaluationRules.forEach((rule: AccessCondition) => {
          // console.log(rule)
          addConditions({
            params: { templateId: data.templateTypeId },
            payload: {
              ...rule,
              policyId
            }
          }).unwrap()
        })
      }

      showToast({
        type: 'success',
        content: $t(
          // eslint-disable-next-line max-len
          { defaultMessage: 'Policy {name} was {editMode, select, true {updated} other {added}}' },
          { name: data.name, editMode }
        )
      })

      navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: '' })
          : $t({ defaultMessage: 'Add Adaptive Policy' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Policies & Profiles > Adaptive Policy' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })
          }
        ]}
      />
      <StepsForm
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => navigate(linkToList)}
        onFinish={handleSubmit}>
        <StepsForm.StepForm initialValues={{ templateTypeId: 0 }}>
          <Loader states={[{
            isLoading: isGetPolicyLoading || isGetConditionsLoading,
            isFetching: isUpdating
          }]}>
            <AdaptivePolicySettingForm/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
