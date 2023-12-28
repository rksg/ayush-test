import React, { useEffect, useRef, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import {
  useAddAdaptivePolicyMutation,
  useAddPolicyConditionsMutation,
  useDeletePolicyConditionsMutation,
  useGetAdaptivePolicyQuery,
  useGetConditionsInPolicyQuery,
  useUpdateAdaptivePolicyMutation, useUpdatePolicyConditionsMutation
} from '@acx-ui/rc/services'
import {
  AccessCondition, CriteriaOption, EvaluationRule,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { AdaptivePolicySettingForm } from './AdaptivePolicySettingForm'

interface AdaptivePolicyFormProps {
  editMode?: boolean,
  drawerMode?: boolean
}

export default function AdaptivePolicyForm (props: AdaptivePolicyFormProps) {
  const { $t } = useIntl()
  const { editMode = false, drawerMode = false } = props
  const { policyId, templateId } = useParams()
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })
  const linkToList = useTenantLink(`/${tablePath}`)
  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance>()
  const [addAdaptivePolicy] = useAddAdaptivePolicyMutation()
  const [addConditions] = useAddPolicyConditionsMutation()
  const [updateConditions] = useUpdatePolicyConditionsMutation()
  const [deleteCondition] = useDeletePolicyConditionsMutation()

  const [updateAdaptivePolicy] = useUpdateAdaptivePolicyMutation()
  // eslint-disable-next-line max-len
  const { data, isLoading: isGetPolicyLoading } = useGetAdaptivePolicyQuery({ params: { policyId, templateId } }, { skip: !editMode })
  // eslint-disable-next-line max-len
  const { data: conditionsData, isLoading: isGetConditionsLoading } = useGetConditionsInPolicyQuery({
    payload: { page: '1', pageSize: '2147483647' },
    params: { policyId, templateId } }, { skip: !editMode })

  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if(data && editMode) {
      formRef.current?.setFieldsValue({
        ...data,
        templateTypeId: Number(templateId),
        attributeGroupId: data.onMatchResponse
      })
    }
  }, [data, editMode])

  useEffect(() =>{
    if(conditionsData && editMode) {
      formRef.current?.setFieldValue('evaluationRules', conditionsData.data.map(item => {
        return { ...item , name: item.templateAttribute?.name }
      } ))
    }
  }, [conditionsData, editMode])

  const handleSubmit = async () => {
    const data = formRef.current?.getFieldsValue()
    setIsUpdating(true)
    try {
      const policyPayload = {
        name: data.name,
        onMatchResponse: data.attributeGroupId
      }
      if(editMode){
        await updateAdaptivePolicy({
          params: { templateId: data.templateTypeId, policyId },
          payload: policyPayload
        }).unwrap()

        const conditions: AccessCondition [] = conditionsData?.data ?? []

        for (let rule of data.evaluationRules) {
          const existRule = conditions.find(item => item.id === rule.id)
          if(existRule){  // Update conditions if value was changed
            if(evaluationRuleChange(existRule.evaluationRule, rule.evaluationRule)) {
              await updateConditions({
                params: { templateId: data.templateTypeId, policyId, conditionId: rule.id },
                payload: {
                  evaluationRule: { ...rule.evaluationRule }
                }
              }).unwrap()
            }
          } else { // Add conditions
            await addConditions({ params: { templateId: data.templateTypeId, policyId },
              payload: { ...rule, policyId } }).unwrap()
          }
        }

        // delete conditions
        if(conditions) {
          for (let condition of conditions) {
            // eslint-disable-next-line max-len
            if (data.evaluationRules.findIndex((p: AccessCondition) => p.id === condition.id) === -1) {
              await deleteCondition({
                params: {
                  templateId: data.templateTypeId,
                  policyId,
                  conditionId: condition.id }
              }).unwrap()
            }
          }
        }

      } else {
        const { id: addedPolicyId } = await addAdaptivePolicy({
          params: { templateId: data.templateTypeId },
          payload: policyPayload
        }).unwrap()

        if(addedPolicyId) {
          for (let rule of data.evaluationRules) {
            // eslint-disable-next-line max-len
            await addConditions({ params: { templateId: data.templateTypeId, policyId: addedPolicyId },
              payload: { ...rule, policyId: addedPolicyId }
            }).unwrap()
          }
        }
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
      console.log(error) // eslint-disable-line no-console
    } finally {
      setIsUpdating(false)
    }
  }

  // eslint-disable-next-line max-len
  const evaluationRuleChange = (oldEvaluationRule: EvaluationRule, newEvaluationRule: EvaluationRule) => {
    if(oldEvaluationRule.criteriaType === CriteriaOption.STRING) {
      return (oldEvaluationRule.regexStringCriteria !==
        newEvaluationRule.regexStringCriteria)
    } else { // CriteriaOption.DATE_RANGE
      return (oldEvaluationRule?.when !==
        newEvaluationRule.when ||
        oldEvaluationRule?.startTime !==
        newEvaluationRule.startTime ||
        oldEvaluationRule?.endTime !==
        newEvaluationRule.endTime)
    }
  }

  return (
    <>
      {!drawerMode &&
        <PageHeader
          title={editMode
            ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
            : $t({ defaultMessage: 'Add Adaptive Policy' })}
          breadcrumb={[
            { text: $t({ defaultMessage: 'Network Control' }) },
            {
              text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true)
            },
            { text: $t({ defaultMessage: 'Adaptive Policy' }),
              link: tablePath }
          ]}
        />
      }
      <StepsFormLegacy
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => navigate(linkToList)}
        onFinish={handleSubmit}>
        <StepsFormLegacy.StepForm initialValues={{ templateTypeId: 0 }}>
          <Loader states={[{
            isLoading: isGetPolicyLoading || isGetConditionsLoading,
            isFetching: isUpdating
          }]}>
            <AdaptivePolicySettingForm editMode={editMode} drawerMode={drawerMode}/>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}

