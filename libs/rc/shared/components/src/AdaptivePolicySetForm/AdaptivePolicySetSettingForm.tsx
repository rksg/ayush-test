import { Form, Input, Switch } from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { GridCol, GridRow, Tooltip }         from '@acx-ui/components'
import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useLazyAdaptivePolicySetListByQueryQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  checkObjectNotExists,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'

import { AccessPolicyTable } from './AccessPolicyTable'

interface AdaptivePolicySetSettingFormProps {
  editMode?: boolean
  accessPolicies: AdaptivePolicy []
  setAccessPolicies: (accessPolicies: AdaptivePolicy [] ) => void
}

export function AdaptivePolicySetSettingForm (props: AdaptivePolicySetSettingFormProps) {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { editMode = false, accessPolicies, setAccessPolicies } = props

  const [getPolicySetList] = useLazyAdaptivePolicySetListByQueryQuery()

  const isPolicyOverrideEnabled = useIsSplitOn(Features.POLICY_OVERRIDE_ENABLED)

  const nameValidator = async (value: string) => {
    const list = (await getPolicySetList({
      params: {
        excludeContent: 'false'
      },
      payload: {
        fields: [ 'name' ],
        page: 1, pageSize: 2000,
        filters: { name: value }
      }
    }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Adaptive Policy Set' }))
  }

  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Policy Set Name' })}
          rules={[
            { required: true },
            { validator: (_, value) => nameValidator(value) },
            { max: 255 },
            { validator: (_, value) => trailingNorLeadingSpaces(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input/>}
          validateTrigger={'onBlur'}
        />
      </GridCol>
      { isPolicyOverrideEnabled &&
        <GridCol col={{ span: 24 }}>
          <Form.Item name='policyOverrideEnabled'
            label={
              <>
                { $t({ defaultMessage: 'Override Services Attributes' }) }
                <Tooltip.Question
                  // eslint-disable-next-line max-len
                  title={$t({ defaultMessage: 'Enable this option to override services attributes with the values specified in the policy set' })}
                  placement='bottom'
                />
              </>
            }
            valuePropName='checked'
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </GridCol>
      }
      <GridCol col={{ span: 24 }}>
        <Form.Item initialValue={[] as AdaptivePolicy []}
          name='accessPolicies'
          label={$t({ defaultMessage: 'Select Access Policies' })}
          rules={[
            { validator: async () => {
              return new Promise<void>((resolve, reject) => {
                if (accessPolicies.length === 0) {
                  return reject(
                    $t({ defaultMessage: 'Please select Access Policies' })
                  )
                }
                return resolve()
              })
            } }
          ]}
          validateTrigger={'onBlur'}
        >
          <AccessPolicyTable
            editMode={editMode}
            accessPolicies={accessPolicies}
            setAccessPolicies={setAccessPolicies}
          />
        </Form.Item>
      </GridCol>
    </GridRow>
  )
}
