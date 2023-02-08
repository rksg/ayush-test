import { useEffect, useRef } from 'react'

import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, PageHeader, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { getPolicyRoutePath, PolicyOperation, PolicyType }  from '@acx-ui/rc/utils'
import { useTenantLink }                                    from '@acx-ui/react-router-dom'

import { AdaptivePolicySettingForm } from './AdaptivePolicySettingForm'

interface AdaptivePolicyFormProps {
  editMode?: boolean
}

export const editAdpativePolicy = {
  id: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
  name: 'test1',
  description: 'for test',
  policyType: 'RADIUS',
  onMatchResponse: 'test'
}

export const editAdpativePolicyConditions = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '73eff1f1-8e9f-418c-8893-698387617d73',
      policyId: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      templateAttributeId: 11,
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      }
    },
    {
      id: 'dd9c41f3-a420-43c4-a029-83230f27a4e0',
      policyId: '6dc81c95-3687-4352-b25b-aa5b583e5e2a',
      templateAttributeId: 12,
      evaluationRule: {
        criteriaType: 'StringCriteria',
        regexStringCriteria: 'test*'
      }
    }
  ]
}

export default function AdaptivePolicyForm (props: AdaptivePolicyFormProps) {
  const { $t } = useIntl()
  const { editMode = false } = props
  // const { policyId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance>()

  const data = editAdpativePolicy
  const conditions = editAdpativePolicyConditions

  useEffect(() => {
    if(data && editMode) {
      formRef.current?.setFieldsValue({ ...data })
    }
  }, [data, editMode])

  useEffect(() =>{
    if(conditions && editMode) {
      formRef.current?.setFieldValue('evaluationRules', conditions.content)
    }
  }, [conditions, editMode])

  const handleEdit = async () => {
  }

  const handleAdd = async () => {
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
        onFinish={editMode? handleEdit: handleAdd}>
        <StepsForm.StepForm>
          {/*<Loader states={[{*/}
          {/*  isLoading: isLoading,*/}
          {/*  isFetching: isUpdating*/}
          {/*}]}>*/}
          <Loader>
            <AdaptivePolicySettingForm/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
