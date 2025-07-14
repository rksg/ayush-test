import { useContext } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { GridCol, GridRow }                       from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { useLazyGetApSnmpPolicyListQuery }        from '@acx-ui/rc/services'
import { ApSnmpActionType, checkObjectNotExists } from '@acx-ui/rc/utils'

import SnmpAgentFormContext from './SnmpAgentFormContext'
import SnmpAgentV2Table     from './SnmpV2AgentTable'
import SnmpAgentV3Table     from './SnmpV3AgentTable'


const SnmpAgentSettingForm = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { dispatch } = useContext(SnmpAgentFormContext)
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  // eslint-disable-next-line

  const [ getApSnmpPolicyList ] = useLazyGetApSnmpPolicyListQuery()

  const nameValidator = async (value: string) => {
    const list = (await getApSnmpPolicyList({
      params,
      enableRbac: isUseRbacApi
    }).unwrap())
      .filter(policy => policy.id !== params.policyId)
      .map(policy => policy.policyName)

    return checkObjectNotExists(list, value, $t({ defaultMessage: 'SNMP agent' }))
  }

  const handleNameChanged = (name: string) => {
    dispatch({
      type: ApSnmpActionType.NAME,
      payload: {
        name: name
      }
    })
  }

  return (
    <>
      <GridRow >
        <GridCol col={{ span: 8 }}>
          <Form.Item
            name={'policyName'}
            label={$t({ defaultMessage: 'Profile Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (rule, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            initialValue={''}
            children={<Input onChange={(e => {handleNameChanged(e.target.value)})} />}
            validateTrigger={'onBlur'}
          />
        </GridCol>
      </GridRow>
      <GridRow >
        <GridCol col={{ span: 14 }}>
          <Form.Item>
            <SnmpAgentV2Table />
          </Form.Item>
        </GridCol>
      </GridRow>
      <GridRow>
        <GridCol col={{ span: 14 }}>
          <Form.Item style={{ paddingTop: '50px' }}>
            <SnmpAgentV3Table />
          </Form.Item>
        </GridCol>
      </GridRow>
    </>
  )
}

export default SnmpAgentSettingForm
