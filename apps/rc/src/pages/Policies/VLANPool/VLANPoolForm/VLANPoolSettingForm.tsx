import React from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { GridCol, GridRow, StepsForm } from '@acx-ui/components'
import { useVlanPoolListQuery }        from '@acx-ui/rc/services'
import {
  checkVlanPoolMembers
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


type VLANPoolSettingFormProps = {
  edit: boolean
}

const VLANPoolSettingForm = (props: VLANPoolSettingFormProps) => {
  const { $t } = useIntl()
  const { edit } = props
  const params = useParams()
  const { data } = useVlanPoolListQuery({
    params,
    payload: {
      fields: ['name', 'id'], sortField: 'name',
      sortOrder: 'ASC', page: 1, pageSize: 10000
    }
  })

  const nameValidator = async (_rule: unknown, value: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!edit && value && data?.length && data?.findIndex((vlanPool) =>
        vlanPool.name === value) !== -1
      ) {
        return reject(
          $t({ defaultMessage: 'The DHCP service with that name already exists' })
        )
      }
      return resolve()
    })
  }
  return (
    <GridRow>
      <GridCol col={{ span: 10 }}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: nameValidator }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='vlanMembers'
          label={$t({ defaultMessage: 'VLANs' })}
          initialValue={''}
          rules={[
            { required: true },
            { validator: (_, value) => checkVlanPoolMembers(value) }
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
