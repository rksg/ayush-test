import { useState } from 'react'

import {
  Form, FormInstance, Input } from 'antd'
import { useIntl } from 'react-intl'

import { Select }                     from '@acx-ui/components'
import { useGetFreeVePortVlansQuery } from '@acx-ui/rc/services'
import { Vlan, VlanVePort }           from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'
import { DefaultOptionType } from 'antd/lib/select'

export const SwitchVeForm = (props: { row? : any, form: FormInstance }) => {
  const { $t } = useIntl()
  const { row, form } = props
  const { switchId, tenantId } = useParams()

  const venueId = 'venueId'


  // const [getVePortVlansList] = useGetFreeVePortVlansQuery({ params: { tenantId,switchId, venueId } })
  const [vlanVePortOption, setVlanVePortOption] = useState([] as VlanVePort[])

  const [venueOption, setVenueOption] = useState([] as DefaultOptionType[])

  const handleVenueChange = async (value: string) => {
  }

  // useEffect(() => {
  //   if (!isVenuesListLoading) {
  //     setVenueOption(
  //       venuesList?.data?.map((item) => ({
  //         label: item.name,
  //         value: item.id
  //       })) ?? []
  //     )
  //   }
  // }, [venuesList])

  return (

    <Form
      // labelCol={{ span: 12 }}
      // labelAlign='left'
      layout='vertical'
      onFinish={(data: any) => {
        form.resetFields()
      }}
    >

      <Form.Item
        label={$t({ defaultMessage: 'VLAN ID' })}
        name='vlanId'
      >
        <Select
          options={[
            {
              label: $t({ defaultMessage: 'Select venue...' }),
              value: 'test'
            }
            // ...venueOption
          ]}
          // onChange={async (value) => await handleVenueChange(value)}
        />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'VE' })}
        name='veId'
      >
        <Input />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'VE Name' })}
        name='name'
      >
        <Input />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'OSPF Area' })}
        name='ospf'
      >
        <Input />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'DHCP Relay Agent' })}
        name='dhcp'
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'IP Subnet Mask' })}
        name='ipsubnet'
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={$t({ defaultMessage: 'Ingress ACL' })}
        name='ingress'
      >
        <Input />
      </Form.Item>


      <Form.Item
        label={$t({ defaultMessage: 'Egress ACL' })}
        name='egress'
      >
        <Input />
      </Form.Item>


    </Form>
  )
}
