import React, { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow, StepsForm }   from '@acx-ui/components'
import { useGetVLANPoolPolicyListQuery } from '@acx-ui/rc/services'
import {
  checkVlanPoolMember,
  VLANPoolPolicyType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


type VLANPoolSettingFormProps = {
  edit: boolean,
  saveState: VLANPoolPolicyType
}

const VLANPoolSettingForm = (props: VLANPoolSettingFormProps) => {
  const { $t } = useIntl()
  const { edit } = props
  const params = useParams()
  const [originalName, setOriginalName] = useState('')
  const { data } = useGetVLANPoolPolicyListQuery({ params: params })

  useEffect(() => {
    if (edit && data) {
      let policyData = data.filter(d => d.id === params.policyId)[0]
      setOriginalName(policyData?.policyName)
    }
  }, [data])
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='policyName'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (rule, value) => {
              if (!edit && value
                  && data && data?.findIndex((policy) => policy.policyName === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The vlan pool policy with that name already exists' })
                )
              }
              if (edit && value && value !== originalName && data
                  && data?.filter((policy) => policy.policyName !== originalName)
                    .findIndex((policy) => policy.policyName === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The vlan pool policy with that name already exists' })
                )
              }
              return Promise.resolve()
            } }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='vlans'
          label={$t({ defaultMessage: 'VLANs' })}
          initialValue={''}
          rules={[
            { required: true },
            { validator: (_, value) => checkVlanPoolMember(value) }
          ]}
          children={<Input/>}
        />
      </GridCol>
      <GridCol col={{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
export default VLANPoolSettingForm
