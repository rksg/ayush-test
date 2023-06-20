import { useEffect, useRef, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, showActionModal, StepsFormLegacy, StepsFormLegacyInstance }                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                from '@acx-ui/feature-toggle'
import { useAddApSnmpPolicyMutation, useGetApSnmpPolicyQuery, useUpdateApSnmpPolicyMutation }    from '@acx-ui/rc/services'
import { ApSnmpPolicy, getPolicyListRoutePath, getPolicyRoutePath, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                         from '@acx-ui/react-router-dom'

import SnmpAgentSettingForm from './SnmpAgentSettingForm'
import * as UI              from './styledComponents'


type SnmpAgentFormProps = {
  editMode: boolean
}

const SnmpAgentForm = (props: SnmpAgentFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const params = useParams()

  const { editMode } = props
  const formRef = useRef<StepsFormLegacyInstance<ApSnmpPolicy>>()

  const { data } = useGetApSnmpPolicyQuery({ params }, { skip: !editMode })

  const [ createApSnmpPolicy ] = useAddApSnmpPolicyMutation()

  const [ updateApSnmpPolicy ] = useUpdateApSnmpPolicyMutation()

  const [saveState, updateSaveState] = useState<ApSnmpPolicy>({} as ApSnmpPolicy )

  const updateSaveData = (saveData: Partial<ApSnmpPolicy>) => {
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

  const handleSaveApSnmpAgentPolicy = async (data: ApSnmpPolicy) => {
    try {
      const payload = { ...data }
      if (!payload.snmpV2Agents) payload.snmpV2Agents = []
      if (!payload.snmpV3Agents) payload.snmpV3Agents = []

      const { snmpV2Agents, snmpV3Agents } = payload
      if (snmpV2Agents.length === 0 && snmpV3Agents.length === 0) {
        showActionModal({
          type: 'error',
          content:
            $t({
              defaultMessage: 'At least one SNMPv2 agent or SNMPv3 agent must be created.'
            })
        })
      } else {
        if (!editMode) {
          await createApSnmpPolicy({
            params,
            payload
          }).unwrap().then((res)=>{
            data.id = res?.response?.id
          })
        } else {
          await updateApSnmpPolicy({
            params,
            payload: data
          }).unwrap()
        }

        navigate(linkToPolicies, { replace: true })
      }
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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'SNMP Agent' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Policies & Profiles' }), link: getPolicyListRoutePath() },
          { text: $t({ defaultMessage: 'SNMP Agent' }), link: tablePath }
        ]}
      />
      <StepsFormLegacy<ApSnmpPolicy>
        formRef={formRef}
        onCancel={handleCancel}
        onFinish={async (data) => { return handleSaveApSnmpAgentPolicy(data) }}
      >
        <UI.OverwriteStepsForm
          name='settings'
          title={$t({ defaultMessage: 'SNMP Agent Settings' })}
        >
          <SnmpAgentSettingForm editMode={editMode} saveState={saveState} />
        </UI.OverwriteStepsForm>
      </StepsFormLegacy>
    </>
  )
}

export default SnmpAgentForm
