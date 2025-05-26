import { useEffect, useReducer } from 'react'

import { Form }                   from 'antd'
import { cloneDeep }              from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, showActionModal, StepsForm } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import {
  useAddApSnmpPolicyMutation,
  useGetApSnmpPolicyQuery,
  useUpdateApSnmpPolicyMutation
} from '@acx-ui/rc/services'
import {
  ApSnmpActionType,
  ApSnmpPolicy,
  usePolicyPageHeaderTitle,
  PolicyOperation,
  PolicyType,
  usePolicyListBreadcrumb,
  usePolicyPreviousPath,
  useAfterPolicySaveRedirectPath
} from '@acx-ui/rc/utils'

import SnmpAgentFormContext, { mainReducer } from './SnmpAgentFormContext'
import SnmpAgentSettingForm                  from './SnmpAgentSettingForm'


type SnmpAgentFormProps = {
  editMode: boolean
}

const SnmpAgentForm = (props: SnmpAgentFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  // eslint-disable-next-line
  const isSNMPv3PassphraseOn = useIsSplitOn(Features.WIFI_SNMP_V3_AGENT_PASSPHRASE_COMPLEXITY_TOGGLE)


  const params = useParams()
  const { editMode } = props

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SNMP_AGENT)
  const pageTitle = usePolicyPageHeaderTitle(editMode, PolicyType.SNMP_AGENT)
  const previousPath = usePolicyPreviousPath(PolicyType.SNMP_AGENT, PolicyOperation.LIST)
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.SNMP_AGENT)
  //eslint-disable-next-line
  const { data } = useGetApSnmpPolicyQuery({ params, enableRbac: isUseRbacApi, isSNMPv3PassphraseOn }, { skip: !editMode })
  const [ createApSnmpPolicy ] = useAddApSnmpPolicyMutation()
  const [ updateApSnmpPolicy ] = useUpdateApSnmpPolicyMutation()


  const [form] = Form.useForm()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName: '',
    snmpV2Agents: [],
    snmpV3Agents: []
  })

  useEffect(() => {
    if (editMode && data) {
      const policyName = data.name || data.policyName
      const newData = cloneDeep(data)
      // update state from API data
      if (state.policyName === '') {
        const payload = {
          state: {
            ...state,
            ...newData,
            policyName
          } }

        dispatch({
          type: ApSnmpActionType.UPDATE_STATE,
          payload
        })
      }

      if (form) {
        form.setFieldsValue({ ...newData, policyName })
      }
    }
  }, [form, editMode, data])

  const isDataValid = (data: ApSnmpPolicy) => {
    const { snmpV2Agents, snmpV3Agents } = data
    if (snmpV2Agents.length === 0 && snmpV3Agents.length === 0) {
      showActionModal({
        type: 'error',
        content:
          $t({
            defaultMessage: 'At least one SNMPv2 agent or SNMPv3 agent must be created.'
          })
      })
      return false
    }

    return true
  }

  const handleSaveApSnmpAgentPolicy = async () => {
    try {
      const clonedData = cloneDeep(state)
      if (isDataValid(clonedData)) {
        const { policyName, ...others } = clonedData
        const payload = (isUseRbacApi) ? { ...others, name: policyName } : clonedData
        if (!editMode) {
          await createApSnmpPolicy({
            params, payload, enableRbac: isUseRbacApi, isSNMPv3PassphraseOn
          }).unwrap()
        } else {
          await updateApSnmpPolicy({
            params, payload, enableRbac: isUseRbacApi, isSNMPv3PassphraseOn
          }).unwrap()
        }

        navigate(redirectPathAfterSave, { replace: true })
      }

    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
      <SnmpAgentFormContext.Provider value={{ state, dispatch }}>
        <StepsForm<ApSnmpPolicy>
          form={form}
          editMode={editMode}
          onCancel={() => navigate(previousPath)}
          onFinish={handleSaveApSnmpAgentPolicy}
        >
          <StepsForm.StepForm>
            <SnmpAgentSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </SnmpAgentFormContext.Provider>
    </>
  )
}

export default SnmpAgentForm
