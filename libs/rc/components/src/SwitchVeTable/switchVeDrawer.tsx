import { useEffect, useState } from 'react'

import {
  Form, Input, InputNumber, Select } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'



// import * as UI from './styledComponents'
import { Button, Drawer, showToast } from '@acx-ui/components'
import { useAddVePortMutation, useGetAclUnionQuery,
  useLazyGetFreeVePortVlansQuery,
  useSwitchDetailHeaderQuery,
  useUpdateVePortMutation } from '@acx-ui/rc/services'
import { VeForm, VeViewModel, VlanVePort } from '@acx-ui/rc/utils'
import { useParams }                       from '@acx-ui/react-router-dom'
import { getIntl, validationMessages }     from '@acx-ui/utils'

interface SwitchVeProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  editData: VeViewModel
}

export const SwitchVeDrawer = (props: SwitchVeProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, isEditMode, editData } = props

  const { switchId, tenantId } = useParams()
  const switchDetailHeader = useSwitchDetailHeaderQuery({ params: { tenantId, switchId } })
  const [venueId, setVenueId] = useState('')
  const aclUnionList = useGetAclUnionQuery({ params: { tenantId, switchId } })

  const [getVePortVlansList] = useLazyGetFreeVePortVlansQuery()
  const [vlanVePortOption, setVlanVePortOption] = useState([] as DefaultOptionType[])
  const [aclOption, setAclOption] = useState([] as DefaultOptionType[])
  const [addVePort] = useAddVePortMutation()
  const [updateVePort] = useUpdateVePortMutation()


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
        key: item,
        value: item

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
          value: item.vlanId,
          disabled: item.usedByVePort //|| editData?.vlanId === item.vlanId
        }))

    setVlanVePortOption(option as DefaultOptionType[])
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }
  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)

  const onSumbit = async (data: VeForm) => {
    const params = { switchId, tenantId }
    setLoading(true)
    try {
      if (!isEditMode) {
        const payload = {
          ...data,
          id: ''
        }
        await addVePort({
          params,
          payload
        }).unwrap()
      } else {
        //     const payload = {
        //       ...editData,
        //       ...data
        //     }
        //     await updateAAAServer({
        //       params,
        //       payload
        //     }).unwrap()
      }
    }
    catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
    setLoading(false)
    onClose()
    const clearButton = document?.querySelector('button[data-id="table-clear-btn"]')
    if (clearButton) {
      // @ts-ignore
      clearButton.click()
    }
  }

  const [resetField, setResetField] = useState(false)
  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const footer = [
    <Button loading={loading} key='saveBtn' onClick={() => form.submit()} type={'primary'} >
      {isEditMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })}
    </Button>,
    <Button disabled={loading} key='cancelBtn' onClick={resetFields}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (

    <Drawer
      title={$t({ defaultMessage: 'View VLAN' })}
      visible={visible}
      onClose={onClose}
      width={443}
      footer={footer}
      destroyOnClose={resetField}
      children={
        <Form
          layout='vertical'
          form={form}
          onFinish={onSumbit}
        >

          <Form.Item
            label={$t({ defaultMessage: 'VLAN ID' })}
            name='vlanId'
            rules={[
              { required: true }]}
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
            initialValue={''}
            rules={[
              { validator: (_, value) => NameRegExp(value) }
            ]}
          >
            <Input />
          </Form.Item>


          <Form.Item
            label={$t({ defaultMessage: 'OSPF Area' })}
            name='ospfArea'
            initialValue={''}
            rules={[
              { validator: (_, value) => OspfRegExp(value) }
            ]}
          >
            <Input />
          </Form.Item>


          <Form.Item
            label={$t({ defaultMessage: 'DHCP Relay Agent' })}
            name='dhcpRelayAgent'
            initialValue={''}
            rules={[
              { validator: (_, value) => DhcpRelayAgentRegExp(value) }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={$t({ defaultMessage: 'IP Address' })}
            name='ipAddress'
            initialValue={''}
            rules={[
              { required: true },
              { validator: (_, value) => IpAddressRegExp(value) }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={$t({ defaultMessage: 'IP Subnet Mask' })}
            name='ipSubnetMask'
            initialValue={''}
            rules={[
              { required: true },
              { validator: (_, value) => IpSubnetMaskRegExp(value) }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={$t({ defaultMessage: 'Ingress ACL' })}
            name='ingressAcl'
            initialValue={''}
          >
            <Select
              options={[
                {
                  label: $t({ defaultMessage: 'NONE' }),
                  value: ''
                },
                ...aclOption
              ]}
            />
          </Form.Item>


          <Form.Item
            label={$t({ defaultMessage: 'Egress ACL' })}
            name='egressAcl'
            initialValue={''}
          >
            <Select
              options={[
                {
                  label: $t({ defaultMessage: 'NONE' }),
                  value: ''
                },
                ...aclOption
              ]}
            />
          </Form.Item>


        </Form>}
    />

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


function IpSubnetMaskRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp('^(^(128|192|224|24[08]|25[245])\.0\.0\.0$)|(^255\.(0|128|192|224|24[08]|25[245])\.0\.0$)|(^255\.255\.(0|128|192|224|24[08]|25[245])\.0$)|(^255\.255\.255\.(0|128|192|224|24[08]|25[245])$)')
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.subnetMask))
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
