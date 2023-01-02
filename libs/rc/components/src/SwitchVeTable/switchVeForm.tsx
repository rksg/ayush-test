import { useEffect, useState } from 'react'

import {
  Form, FormInstance, Input, InputNumber, Select } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'



// import * as UI from './styledComponents'
import { useGetAclUnionQuery,
  useLazyGetFreeVePortVlansQuery,
  useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { VeForm, VeViewModel, VlanVePort } from '@acx-ui/rc/utils'
import { useParams }                       from '@acx-ui/react-router-dom'
import { getIntl, validationMessages }     from '@acx-ui/utils'



export const SwitchVeForm = (props: { row? : VeViewModel, form: FormInstance }) => {
  const { $t } = useIntl()
  const { row, form } = props
  const { switchId, tenantId } = useParams()
  const switchDetailHeader = useSwitchDetailHeaderQuery({ params: { tenantId, switchId } })
  const [venueId, setVenueId] = useState('')
  const aclUnionList = useGetAclUnionQuery({ params: { tenantId, switchId } })

  const [getVePortVlansList] = useLazyGetFreeVePortVlansQuery()
  const [vlanVePortOption, setVlanVePortOption] = useState([] as DefaultOptionType[])
  const [aclOption, setAclOption] = useState([] as DefaultOptionType[])



  useEffect(() => {
    if (switchDetailHeader.data) {
      setVenueId(switchDetailHeader.data.venueId)
    }
  }, [switchDetailHeader.data])

  useEffect(() => {
    if (venueId) {
      handleVlanVePortOption()
    }
  }, [venueId])

  useEffect(() => {
    if (!aclUnionList.isLoading && aclUnionList.data) {

      let aclList: string[] = []
      if (aclUnionList.data.switchAcl) {
        aclList = [...aclUnionList.data.switchAcl]
      }
      if (aclUnionList.data.profileAcl) {
        aclList = [...aclList, ...aclUnionList.data.profileAcl]
      }
      const option = aclList.map((item: string) => ({
        label: item,
        key: item
      }))
      setAclOption(option as DefaultOptionType[])
    }
  }, [aclUnionList])

  const handleVlanVePortOption = async () => {
    const option =
      (await getVePortVlansList({ params: { tenantId, venueId, switchId } })).data
        ?.map((item: VlanVePort) => ({
          label: `VLAN-${item.vlanId}`,
          key: item.vlanId,
          disabled: item.usedByVePort //|| row?.vlanId === item.vlanId
        }))

    setVlanVePortOption(option as DefaultOptionType[])
  }

  return (

    <Form
      layout='vertical'
      onFinish={(data: VeForm) => {
        form.resetFields()
      }}
    >

      <Form.Item
        label={$t({ defaultMessage: 'VLAN ID' })}
        name='vlanId'
        initialValue={null}
      >
        <Select
          options={[
            {
              label: $t({ defaultMessage: 'Select...' }),
              value: null
            },
            ...vlanVePortOption
          ]}
        />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'VE' })}
        name='veId'
        rules={[
          { required: true }]}
      >
        <span style={{
          display: 'flex',
          fontSize: 'var(--acx-body-3-font-size)',
          lineHeight: '32px'
        }}>
          VE-
          <InputNumber style={{ marginLeft: '5px' }} min={1} max={4095}/></span>
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'VE Name' })}
        name='name'
        rules={[
          { validator: (_, value) => NameRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'OSPF Area' })}
        name='ospfArea'
        rules={[
          { validator: (_, value) => OspfRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'DHCP Relay Agent' })}
        name='dhcpRelayAgent'
        rules={[
          { validator: (_, value) => DhcpRelayAgentRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'IP Address' })}
        name='ipAddress'
        rules={[
          { required: true },
          { validator: (_, value) => IpAddressRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'IP Subnet Mask' })}
        name='ipsubnet'
        rules={[
          { required: true },
          { validator: (_, value) => IpAddressRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Ingress ACL' })}
        name='ingress'
        initialValue={null}
      >
        <Select
          options={[
            {
              label: $t({ defaultMessage: 'Select...' }),
              value: null
            },
            ...aclOption
          ]}
        />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'Egress ACL' })}
        name='egress'
        initialValue={null}
      >
        <Select
          options={[
            {
              label: $t({ defaultMessage: 'Select...' }),
              value: null
            },
            ...aclOption
          ]}
        />
      </Form.Item>


    </Form>
  )
}
function NameRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('(?=^((?!(`|\\$\\()).){1,255}$)^(\\S.*\\S)$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.name))
  }
  return Promise.resolve()
}


function IpAddressRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[01][0-9]|22[0-3])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){3}$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

function OspfRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('(^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){3}$)|(^[0-9]*$)')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ospf))
  }
  return Promise.resolve()
}

function DhcpRelayAgentRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){2}\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.dhcpRelayAgent))
  }
  return Promise.resolve()
}
