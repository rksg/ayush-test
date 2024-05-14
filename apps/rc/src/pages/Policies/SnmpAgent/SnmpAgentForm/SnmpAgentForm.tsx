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
  generatePolicyPageHeaderTitle,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  ApiVersionEnum,
  usePolicyListBreadcrumb,
  RbacApSnmpPolicy
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import SnmpAgentFormContext, { mainReducer } from './SnmpAgentFormContext'
import SnmpAgentSettingForm                  from './SnmpAgentSettingForm'


type SnmpAgentFormProps = {
  editMode: boolean
}

const oldApSnmp: ApSnmpPolicy = {
  policyName: '',
  snmpV2Agents: [],
  snmpV3Agents: []
}

const rbacApSnmp: RbacApSnmpPolicy = {
  name: '',
  snmpV2Agents: [],
  snmpV3Agents: []
}

const SnmpAgentForm = (props: SnmpAgentFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const rbacApiVersion = isUseRbacApi ? ApiVersionEnum.v1 : undefined
  const params = useParams()
  const { editMode } = props

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SNMP_AGENT)
  const pageTitle = generatePolicyPageHeaderTitle(editMode, false, PolicyType.SNMP_AGENT)
  //eslint-disable-next-line
  const { data } = useGetApSnmpPolicyQuery({ params, payload: { rbacApiVersion } }, { skip: !editMode })
  const [ createApSnmpPolicy ] = useAddApSnmpPolicyMutation()
  const [ updateApSnmpPolicy ] = useUpdateApSnmpPolicyMutation()


  const [form] = Form.useForm()
  const [state, dispatch] = useReducer(mainReducer, (isUseRbacApi? rbacApSnmp : oldApSnmp))

  // eslint-disable-next-line
  function retrieveNameFromState (object: ApSnmpPolicy | RbacApSnmpPolicy): string {
    if('policyName' in object) {
      object as ApSnmpPolicy
      return object.policyName
    }
    else {
      object as RbacApSnmpPolicy
      return object.name
    }
  }

  useEffect(() => {
    if (editMode && data) {
      // update state from API data
      if (retrieveNameFromState(state) === '') {
        const newData = cloneDeep(data)
        const payload = {
          state: {
            ...state,
            ...newData
          } }

        dispatch({
          type: ApSnmpActionType.UPDATE_STATE,
          payload
        })
      }

      if (form) {
        form.setFieldsValue(data)
      }
    }
  }, [form, editMode, data])

  const isDataValid = (data: ApSnmpPolicy | RbacApSnmpPolicy) => {
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
      const payload = { ...cloneDeep(state), ...(isUseRbacApi && { rbacApiVersion }) }
      if (isDataValid(payload)) {
        if (!editMode) {
          await createApSnmpPolicy({ params, payload }).unwrap()
          // const results = await createApSnmpPolicy({ params, payload }).unwrap()
          // const response = results.response as { id: string }
        } else {
          await updateApSnmpPolicy({ params, payload }).unwrap()
        }

        navigate(linkToPolicies, { replace: true })
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
          onCancel={() => navigate(linkToPolicies, { replace: true })}
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
