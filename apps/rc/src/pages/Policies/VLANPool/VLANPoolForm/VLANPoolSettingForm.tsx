import React from 'react'

import { Form, Input }               from 'antd'
import { useIntl, FormattedMessage } from 'react-intl'

import { GridCol, GridRow, StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { useVlanPoolListQuery }                       from '@acx-ui/rc/services'
import {
  checkVlanPoolMembers, servicePolicyNameRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


type VLANPoolSettingFormProps = {
  edit: boolean,
  networkView?: boolean,
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
          $t({ defaultMessage: 'The VLAN Pool with that name already exists' })
        )
      }
      return resolve()
    })
  }
  return (
    <GridRow>
      <GridCol col={props.networkView ? { span: 24 } :{ span: 8 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: nameValidator },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          rules={[
            { max: 255 }
          ]}
          initialValue={''}
          children={<Input/>}
        />
        <Form.Item
          name='vlanMembers'
          label={<>{$t({ defaultMessage: 'VLANs' })}
            <Tooltip.Question
              placement='right'
              title={<FormattedMessage
                values={{
                  br: (chunks) => <>{chunks}<br /></>
                }}
                /* eslint-disable max-len */
                defaultMessage={`
                  You can enter a single VLAN, multiple VLANs separated by comma (e.g. 6, 8, 158), or a VLAN range (e.g. 6-47).<br></br>
                  Valid values are between 2 and 4094. For ranges, the start value must be less than the end value.<br></br>
                  The total number of VLAN members per pool is 64 (including ranges)<br></br>
                  IF DHCP/NAT is enabled on a venue, the VLANs configured should be aligned with the VLANs in the DHCP profiles. Otherwise, clients may experience connectivity issues<br></br>
                `}
                /* eslint-enable */
              />}
            />
          </>}
          initialValue={''}
          rules={[
            { required: true },
            { validator: (_, value) => checkVlanPoolMembers(value) }
          ]}
          children={<Input/>}
        />
      </GridCol>
      <GridCol col={props.networkView ? { span: 0 } :{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
export default VLANPoolSettingForm
