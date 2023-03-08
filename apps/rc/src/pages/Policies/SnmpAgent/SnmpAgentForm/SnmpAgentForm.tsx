import { useEffect, useRef, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm, StepsFormInstance }                                           from '@acx-ui/components'
import { useAddApSnmpPolicyMutation, useGetApSnmpPolicyQuery, useUpdateApSnmpPolicyMutation } from '@acx-ui/rc/services'
import { ApSnmpProfile, getPolicyListRoutePath }                                              from '@acx-ui/rc/utils'
import { useTenantLink }                                                                      from '@acx-ui/react-router-dom'

//import SnmpAgentSettingForm from './SnmpAgentSettingForm'

type SnmpAgentFormProps = {
  editMode: boolean
}

const SnmpAgentForm = (props: SnmpAgentFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(getPolicyListRoutePath())
  const params = useParams()

  const { editMode } = props
  const formRef = useRef<StepsFormInstance<ApSnmpProfile>>()

  const { data } = useGetApSnmpPolicyQuery({ params }, { skip: !editMode })

  const [ createApSnmpPolicy ] = useAddApSnmpPolicyMutation()

  const [ updateApSnmpPolicy ] = useUpdateApSnmpPolicyMutation()

  const [saveState, updateSaveState] = useState<ApSnmpProfile>({} as ApSnmpProfile )

  const updateSaveData = (saveData: Partial<ApSnmpProfile>) => {
    updateSaveState({ ...saveState, ...saveData })
  }

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleSaveApSnmpAgentPolicy = async (data: ApSnmpProfile) => {
    try {
      if (!editMode) {
        await createApSnmpPolicy({
          params,
          payload: data
        }).unwrap().then(()=>{
          //data.id = res?.response?.id
        })
      } else {
        await updateApSnmpPolicy({
          params,
          payload: data
        }).unwrap()
      }

      navigate(linkToPolicies, { replace: true })
    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(linkToPolicies)
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit SNMP Agent' })
          : $t({ defaultMessage: 'Add SNMP Agent' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath() },
          { text: $t({ defaultMessage: 'SNMP Agent' }), link: '/policies/snmpAgent/list' }
        ]}
      />
      <StepsForm<ApSnmpProfile>
        formRef={formRef}
        onCancel={handleCancel}
        onFinish={async (data) => { return handleSaveApSnmpAgentPolicy(data) }}
      >
        <StepsForm.StepForm
          name='profile'

        >
         test
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default SnmpAgentForm
