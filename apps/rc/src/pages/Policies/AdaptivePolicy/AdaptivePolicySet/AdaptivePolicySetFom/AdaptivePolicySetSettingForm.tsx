import React, { useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'
import { useParams }   from 'react-router-dom'

import { GridCol, GridRow }                 from '@acx-ui/components'
import {
  useLazyAdaptivePolicySetLisByQueryQuery
} from '@acx-ui/rc/services'
import {
  AdaptivePolicy,
  checkObjectNotExists
} from '@acx-ui/rc/utils'

import AccessPolicyTable                from './AccessPolicyTable'
import { AdaptivePolicyFormDrawer }     from './AdaptivePolicyFormDrawer'
import { AdaptivePoliciesSelectDrawer } from './AdaptivePolicySelectDrawer'

interface AdaptivePolicySetSettingFormProps {
  editMode?: boolean
  accessPolicies: AdaptivePolicy []
  setAccessPolicies: (accessPolicies: AdaptivePolicy [] ) => void
}

export function AdaptivePolicySetSettingForm (props: AdaptivePolicySetSettingFormProps) {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { editMode = false, accessPolicies, setAccessPolicies } = props

  const [adaptivePolicyDrawerVisible, setAdaptivePolicyDrawerVisible] = useState(false)
  const [adaptivePoliciesSelectDrawer, setAdaptivePoliciesSelectDrawerVisible] = useState(false)

  const [getPolicySetList] = useLazyAdaptivePolicySetLisByQueryQuery()

  const nameValidator = async (value: string) => {
    const list = (await getPolicySetList({
      params: {
        excludeContent: 'false'
      },
      payload: {
        fields: [ 'name' ],
        page: 0, pageSize: 10,
        filters: { name: value }
      }
    }).unwrap()).data.filter(n => n.id !== policyId).map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value }, $t({ defaultMessage: 'Adaptive Policy Set' }))
  }

  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input/>}
          />
        </GridCol>
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
          >
            <AccessPolicyTable
              editMode={editMode}
              setAdaptivePoliciesSelectDrawerVisible={setAdaptivePoliciesSelectDrawerVisible}
              accessPolicies={accessPolicies}
              setAccessPolicies={setAccessPolicies}
            />
          </Form.Item>
        </GridCol>
      </GridRow>
      <AdaptivePoliciesSelectDrawer
        visible={adaptivePoliciesSelectDrawer}
        setVisible={setAdaptivePoliciesSelectDrawerVisible}
        setAdaptivePolicyDrawerVisible={setAdaptivePolicyDrawerVisible}
        accessPolicies={accessPolicies}
        setAccessPolicies={setAccessPolicies}/>
      <AdaptivePolicyFormDrawer
        visible={adaptivePolicyDrawerVisible}
        setVisible={setAdaptivePolicyDrawerVisible}
      />
    </>
  )
}
