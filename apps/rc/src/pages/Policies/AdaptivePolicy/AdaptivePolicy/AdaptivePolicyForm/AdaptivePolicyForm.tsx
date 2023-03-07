import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddAdaptivePolicyMutation,
  useAddPolicyConditionsMutation,
  useGetAdaptivePolicyQuery,
  useGetConditionsInPolicyQuery,
  useLazyAdaptivePolicyLisByQueryQuery,
  useUpdateAdaptivePolicyMutation
} from '@acx-ui/rc/services'
import { AccessCondition, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                    from '@acx-ui/react-router-dom'

import { AdaptivePolicySettingForm } from './AdaptivePolicySettingForm'

interface AdaptivePolicyFormProps {
  editMode?: boolean
}

// enum CheckResult {
//   EXIST,
//   NO_EXIST,
//   CHANGE
// }

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

  const [policyList] = useLazyAdaptivePolicyLisByQueryQuery()

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
      formRef.current?.setFieldValue('evaluationRules', conditionsData.data)
    }
  }, [conditionsData, editMode])

  // const checkConditionExist = (existConditions: AccessCondition[], condition: AccessCondition) => {
  //   return false
  // }

  const handleSubmit = async () => {
    const data = formRef.current?.getFieldsValue()
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

        // const addList = [], deleteList = []
        // data.evaluationRules.forEach((rule: AccessCondition) => {
        //   const exist = checkConditionExist(conditionsData?.data ?? [], rule)
        //   if(exist === CheckResult.NO_EXIST) {
        //     deleteList.push(rule)
        //   } else if(exist == CheckResult.) {
        //     deleteList.push(rule)
        //   }
        //   // existConditions.includes()
        //   // addConditions({
        //   //   params: { templateId: data.templateTypeId, policyId },
        //   //   payload: {
        //   //     ...rule,
        //   //     policyId: policyId
        //   //   }
        //   // }).unwrap()
        // })
      } else {
        await addAdaptivePolicy({
          params: { templateId: data.templateTypeId },
          payload: policyPayload
        }).unwrap()

        const policies = (await policyList({
          params: {
            excludeContent: 'false'
          },
          payload: {
            fields: [ 'name' ],
            page: 1, pageSize: 10,
            filters: { name: policyPayload.name }
          }
        }).unwrap()).data.map(n => ({ id: n.id }))

        if(policies.length > 0) {
          data.evaluationRules.forEach((rule: AccessCondition) => {
            addConditions({
              params: { templateId: data.templateTypeId, policyId: policies[0].id },
              payload: {
                ...rule,
                policyId: policies[0].id
              }
            }).unwrap()
          })
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
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
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
            <AdaptivePolicySettingForm editMode={editMode}/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

