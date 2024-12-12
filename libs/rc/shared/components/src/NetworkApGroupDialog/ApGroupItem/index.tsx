/* eslint-disable max-len */
import { Checkbox, Col, Form, Input } from 'antd'
import _                              from 'lodash'
import { useIntl }                    from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  getVlanPool,
  IsNetworkSupport6g,
  NetworkApGroup,
  NetworkSaveData,
  validateRadioBandForDsaeNetwork,
  VlanPool,
  VlanType
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { VlanDate }    from '../index'
import { RadioSelect } from '../RadioSelect'
import * as UI         from '../styledComponents'
import { VlanInput }   from '../VlanInput'

interface ApGroupItemProps {
  apgroup: NetworkApGroup;
  name: number;
  vlanPoolSelectOptions: VlanPool[] | undefined;
  network: NetworkSaveData | undefined | null;
}

export const ApGroupItem = (props: ApGroupItemProps) => {
  const intl = useIntl()
  const { apgroup, name, vlanPoolSelectOptions, network } = props
  const { wlan } = network || {}
  const isSupport6G = IsNetworkSupport6g(network)

  const apGroupName = apgroup?.isDefault ? intl.$t({ defaultMessage: 'APs not assigned to any group' }) : apgroup?.apGroupName

  const form = Form.useFormInstance()

  const apGroupVlanId = apgroup?.vlanId || wlan?.vlanId
  const apGroupVlanPool = getVlanPool(apgroup, wlan, vlanPoolSelectOptions)
  const apGroupVlanType = apGroupVlanPool ? VlanType.Pool : VlanType.VLAN

  const handleVlanInputChange = (value: VlanDate) => {
    const isPoolType = value.vlanType === VlanType.Pool
    form.setFields([
      { name: ['apgroups', name, 'vlanId'], value: !isPoolType ? value.vlanId : '' },
      { name: ['apgroups', name, 'vlanPoolId'], value: isPoolType ? value.vlanPool?.id||'' : '' },
      { name: ['apgroups', name, 'vlanPoolName'], value: isPoolType ? value.vlanPool?.name||'' : '' },
      { name: ['apgroups', name, 'vlanType'], value: value.vlanType }
    ])
  }

  const selected = Form.useWatch(['apgroups', name, 'selected'], form)

  let errorTooltip = ''
  if (apgroup?.validationError) {
    if (apgroup.validationErrorReachedMaxConnectedNetworksLimit) {
      errorTooltip = intl.$t({ defaultMessage: 'You cannot activate this network on this AP Group because it already has 15 active networks' })
    } else {
      errorTooltip = intl.$t({ defaultMessage: 'You cannot activate this network to this AP Group. A network with the same SSID is already active' })
    }
  }

  return (
    <>
      <Tooltip title={errorTooltip}><Col span={8}>
        <Form.Item name={[name, 'apGroupId']} noStyle>
          <Input type='hidden' />
        </Form.Item>
        <Form.Item name={[name, 'vlanType']} initialValue={apGroupVlanType} noStyle>
          <Input type='hidden' />
        </Form.Item>
        { apgroup.vlanId &&
          <Form.Item name={[name, 'vlanId']} initialValue={apGroupVlanId} noStyle>
            <Input type='hidden' />
          </Form.Item>
        }
        { !apgroup.vlanId && <>
          <Form.Item name={[name, 'vlanPoolId']} initialValue={apGroupVlanPool?.id} noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item name={[name, 'vlanPoolName']} initialValue={apGroupVlanPool?.name} noStyle>
            <Input type='hidden' />
          </Form.Item>
        </>}

        <UI.FormItemRounded name={[name, 'selected']} valuePropName='checked'>
          <Checkbox disabled={apgroup.validationError}
            onChange={() => { form.validateFields() }}>{apGroupName}</Checkbox>
        </UI.FormItemRounded>
      </Col></Tooltip>
      <Col span={8}>
        <UI.FormItemRounded>
          {vlanPoolSelectOptions && apgroup && <VlanInput
            key={name}
            apgroup={apgroup}
            wlan={wlan}
            vlanPoolSelectOptions={vlanPoolSelectOptions}
            onChange={handleVlanInputChange}
            selected={selected}
          />}
        </UI.FormItemRounded>
      </Col>
      <Col span={8}>
        <UI.FormItemRounded
          name={[name, 'radioTypes']}
          rules={[
            {
              validator: (obj, value) => {
                const { $t } = getIntl()
                if (form.getFieldsValue().apgroups[name].selected && _.isEmpty(value)) {
                  return Promise.reject($t({ defaultMessage: 'Please enter Radio Band' }))
                }
                return Promise.resolve()
              }
            },
            {
              validator: (obj, value) => {
                if (form.getFieldsValue().apgroups[name].selected)
                  return validateRadioBandForDsaeNetwork(value, network, intl)

                return Promise.resolve()
              }
            }
          ]}>
          { selected ? <RadioSelect isSupport6G={isSupport6G}/> : <Input type='hidden' /> }
        </UI.FormItemRounded>
      </Col>
    </>
  )
}
