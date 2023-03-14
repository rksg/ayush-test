import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddAdaptivePolicyMutation,
  useAddPolicyConditionsMutation,
  useGetAdaptivePolicyQuery,
  useGetConditionsInPolicyQuery,
  useUpdateAdaptivePolicyMutation
} from '@acx-ui/rc/services'
import {
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

// enum CheckResult {
//   EXIST,
//   NO_EXIST,
//   CHANGE
// }

export default function AdaptivePolicyForm (props: AdaptivePolicyFormProps) {
  const { $t } = useIntl()
  const { editMode = false, drawerMode = false } = props
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
        // TODO waiting batch update conditions API
      } else {
        const { id: addedPolicyId } = await addAdaptivePolicy({
          params: { templateId: data.templateTypeId },
          payload: policyPayload
        }).unwrap()

        if(addedPolicyId) {
          for (let rule of data.evaluationRules) {
            await addConditions({
              params: { templateId: data.templateTypeId, policyId: addedPolicyId },
              payload: {
                ...rule,
                policyId: addedPolicyId
              }
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
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
          : $t({ defaultMessage: 'Add Adaptive Policy' })}
        breadcrumb={[
          // eslint-disable-next-line max-len
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath(true) },
          { text: $t({ defaultMessage: 'Adaptive Policy' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }) }
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
            <AdaptivePolicySettingForm editMode={editMode} drawerMode={drawerMode}/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

