import { useEffect, useRef } from 'react'

import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Loader, PageHeader, StepsForm, StepsFormInstance }                from '@acx-ui/components'
import { AdaptivePolicy, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                   from '@acx-ui/react-router-dom'

import { assignConditions, editAdpativePolicy } from './__test__/fixtures'
import { AdaptivePolicySettingForm }            from './AdaptivePolicySettingForm'

interface AdaptivePolicyFormProps {
  editMode?: boolean
}

export default function AdaptivePolicyForm (props: AdaptivePolicyFormProps) {
  const { $t } = useIntl()
  const { editMode = false } = props
  // const { policyId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance>()

  // TODO: just for mock data
  const data = editAdpativePolicy as AdaptivePolicy
  const conditions = assignConditions.content

  useEffect(() => {
    if(data && editMode) {
      formRef.current?.setFieldsValue({ ...data })
    }
  }, [data, editMode])

  useEffect(() =>{
    if(conditions && editMode) {
      formRef.current?.setFieldValue('evaluationRules', conditions)
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
