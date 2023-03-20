import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { GridCol, GridRow, StepsForm }        from '@acx-ui/components'
import { useLazyGetApSnmpPolicyListQuery }    from '@acx-ui/rc/services'
import { ApSnmpPolicy, checkObjectNotExists } from '@acx-ui/rc/utils'

import SnmpAgentV2Table from './SnmpV2AgentTable'
import SnmpAgentV3Table from './SnmpV3AgentTable'



type SnmpAgentSettingFormProps = {
  editMode: boolean,
  saveState: ApSnmpPolicy
}

const SnmpAgentSettingForm = (props: SnmpAgentSettingFormProps) => {
  const { $t } = useIntl()
  //const { editMode, saveState } = props
  const { saveState } = props
  const { snmpV2Agents, snmpV3Agents } = saveState || {}


  const params = useParams()
  //const form = Form.useFormInstance()
  const [ getApSnmpPolicyList ] = useLazyGetApSnmpPolicyListQuery()

  const nameValidator = async (value: string) => {
    const list = (await getApSnmpPolicyList({ params }).unwrap())
      .filter(policy => policy.id !== params.policyId)
      .map(policy => ({ name: policy.policyName }))
    return checkObjectNotExists(list, { name: value } ,
      $t({ defaultMessage: 'SNMP agent' }))
  }

  return (
    <>
      <GridRow >
        <GridCol col={{ span: 8 }}>
          <Form.Item
            name='policyName'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (rule, value) => nameValidator(value),
                validateTrigger: 'onChange' }
            ]}
            validateFirst
            validateTrigger='onChange'
            hasFeedback
            initialValue={''}
            children={<Input/>}
          />
        </GridCol>
      </GridRow>
      <GridRow >
        <GridCol col={{ span: 14 }}>
          <StepsForm.Title>{$t({ defaultMessage: 'SNMP Agent Settings' })}</StepsForm.Title>
          <Form.Item name='snmpV2Agents'>
            <SnmpAgentV2Table data={snmpV2Agents} />
          </Form.Item>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 14 }}>
          <Form.Item name='snmpV3Agents' style={{ paddingTop: '50px' }}>
            <SnmpAgentV3Table data={snmpV3Agents} />
          </Form.Item>
        </GridCol>
      </GridRow>
    </>
  )
}

export default SnmpAgentSettingForm
