import { useEffect, useState } from 'react'

import {
  Form, Input, InputNumber, Radio, RadioChangeEvent, Select, Space } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'

import { Alert, Button, Drawer } from '@acx-ui/components'
import {
  useAddVePortMutation,
  useLazyGetFreeVePortVlansQuery,
  useLazyGetAclUnionQuery,
  useLazyGetSwitchListQuery,
  useLazyGetSwitchQuery,
  useLazySwitchDetailHeaderQuery,
  useUpdateVePortMutation } from '@acx-ui/rc/services'
import {
  AclUnion,
  IP_ADDRESS_TYPE,
  Switch,
  SwitchViewModel,
  VeForm,
  VeViewModel,
  VlanVePort,
  VenueMessages
} from '@acx-ui/rc/utils'
import { useParams }                   from '@acx-ui/react-router-dom'
import { getIntl, validationMessages } from '@acx-ui/utils'

interface SwitchVeProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  isVenueLevel: boolean
  editData: VeViewModel,
  readOnly: boolean
}

export const SwitchVeDrawer = (props: SwitchVeProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, isEditMode, isVenueLevel, editData, readOnly } = props

  const [form] = Form.useForm()
  const [loading, setLoading] = useState<boolean>(false)
  const { switchId: sid, tenantId, venueId: vid } = useParams()
  const [venueId, setVenueId] = useState(vid ?? '')
  const [switchId, setSwitchId] = useState(isVenueLevel ? editData?.switchId : sid)

  const [switchDetailHeaderData, setSwitchDetailHeaderData]
    = useState(null as unknown as SwitchViewModel)
  const [aclUnionList, setAclUnionList] = useState(null as unknown as AclUnion)
  const [switchData, setSwitchData] = useState(null as unknown as Switch)

  const [getVePortVlansList] = useLazyGetFreeVePortVlansQuery()
  const [getAclUnion] = useLazyGetAclUnionQuery()
  const [getSwitch] = useLazyGetSwitchQuery()
  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [switchDetailHeader] = useLazySwitchDetailHeaderQuery()
  const [switchOption, setSwitchOption] = useState([] as DefaultOptionType[])

  const [vlanVePortOption, setVlanVePortOption] = useState([] as DefaultOptionType[])
  const [aclOption, setAclOption] = useState([] as DefaultOptionType[])
  const [addVePort] = useAddVePortMutation()
  const [updateVePort] = useUpdateVePortMutation()
  const [resetField, setResetField] = useState(false)

  //Only for edit mode
  const [isIncludeIpSetting, setIsIncludeIpSetting] = useState(false)
  const [enableDhcp, setEnableDhcp] = useState(false)
  const [dhcpServerEnabled, setDhcpServerEnabled] = useState(false)
  const [disableIpSetting, setDisableIpSetting] = useState(false)
  const [ipAddressFromDH, setIpAddressFromDH] = useState('')
  const [ipSubnetFromDH, setIpSubnetFromDH] = useState('')

  const getSwitches = async () => {
    const payload = { filters: { venueId: [venueId] } }
    const switches =(await getSwitchList({ params: { tenantId: tenantId }, payload }, true))
      .data?.data?.filter(s => s.deviceStatus === 'ONLINE' && s.switchType === 'router')
    setSwitchOption(switches?.map(s => ({ label: s.name, key: s.id, value: s.id })) ?? [])
  }

  const getSwitchDetailHeader = async (switchId: string) => {
    const { data } = await switchDetailHeader({ params: { tenantId, switchId } })
    setSwitchDetailHeaderData(data as SwitchViewModel)
  }
  const getAclUnionData = async (switchId: string) => {
    const { data } = await getAclUnion({ params: { tenantId, switchId } })
    setAclUnionList(data as AclUnion)
  }
  const getSwitchData = async (switchId: string) => {
    const { data } = await getSwitch({ params: { tenantId, switchId } })
    setSwitchData(data as Switch)
  }

  useEffect(()=>{
    if (isEditMode && editData && visible) {
      form.setFieldsValue({
        ...editData,
        ...{
          ingressAcl: editData.ingressAclName || '',
          egressAcl: editData.egressAclName || ''
        }
      })
      setIsIncludeIpSetting(!_.isEmpty(editData.ipAddressType))
      setEnableDhcp(editData.ipAddressType === IP_ADDRESS_TYPE.DYNAMIC)
      if (disableIpSetting) {
        if (_.isEmpty(editData.ipAddress) && !_.isEmpty(ipAddressFromDH)) {
          form.setFieldValue('ipAddress', ipAddressFromDH)
        }

        if (_.isEmpty(editData.ipSubnetMask) && !_.isEmpty(ipSubnetFromDH)) {
          form.setFieldValue('ipSubnetMask', ipSubnetFromDH)
        }
      }
    }
  }, [editData, visible, disableIpSetting])

  useEffect(() => {
    if (switchDetailHeaderData) {
      setVenueId(switchDetailHeaderData.venueId)
      const ipFullContentParsed = switchDetailHeaderData.ipFullContentParsed
      setDisableIpSetting( ipFullContentParsed === false)
      setIpAddressFromDH(switchDetailHeaderData.ipAddress || '')
      setIpSubnetFromDH(switchDetailHeaderData.subnetMask || '')
    }

    if(switchData){
      setDhcpServerEnabled(switchData.dhcpServerEnabled || false)
    }
  }, [switchDetailHeaderData, switchData])

  useEffect(() => {
    if (venueId) {
      getSwitches()
    }
    if (switchId) {
      getSwitchDetailHeader(switchId)
      getAclUnionData(switchId)
      getSwitchData(switchId)
    }
    switchId && venueId && handleVlanVePortOption()
  }, [venueId, switchId])

  useEffect(() => {
    if (aclUnionList) {
      let aclList: string[] = []
      if (aclUnionList.switchAcl) {
        aclList = [...aclUnionList.switchAcl]
      }
      if (aclUnionList.profileAcl) {
        aclList = [...aclList, ...aclUnionList.profileAcl]
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
          disabled: item.usedByVePort && String(editData?.vlanId) !== item.vlanId
        })) ?? []

    setVlanVePortOption(option as DefaultOptionType[])
  }

  const onClose = () => {
    setVisible(false)
    form.resetFields()
    setIsIncludeIpSetting(false)
    setEnableDhcp(false)
    setDhcpServerEnabled(false)
    setDisableIpSetting(false)
  }

  const onSubmit = async (data: VeForm) => {
    const params = { switchId, tenantId, vePortId: editData.id || '' }
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
        let payload = {
          ...editData,
          ...data
        }

        if (!isIncludeIpSetting) {
          delete payload.ipAddressType
        }

        if (disableIpSetting) {
          delete payload.ipAddressType
          delete payload.ipAddress
          delete payload.ipSubnetMask
        }

        await updateVePort({
          params,
          payload
        }).unwrap()
      }
    }
    catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
    setLoading(false)
    onClose()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const onIpAddressTypeChange = (e: RadioChangeEvent) => {
    setEnableDhcp(e.target.value === IP_ADDRESS_TYPE.DYNAMIC)
  }

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='ve-port-footer'>
      <Button
        disabled={loading}
        key='cancelBtn'
        onClick={resetFields}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        loading={loading}
        key='saveBtn'
        type='secondary'
        onClick={() => form.submit()}
      >
        {isEditMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })}
      </Button>
    </Space>
  ]

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit VE Port' })
        : $t({ defaultMessage: 'Add VE Port' })}
      visible={visible}
      onClose={onClose}
      width={443}
      footer={footer}
      destroyOnClose={resetField}
      children={<>
        { readOnly &&
          <Alert type='info'
            style={{ marginBottom: '10px' }}
            message={$t(VenueMessages.CLI_APPLIED)}
          />
        }
        <Form
          layout='vertical'
          form={form}
          onFinish={readOnly ? onClose : onSubmit}
        >
          { isVenueLevel && !isEditMode && <Form.Item
            label={$t({ defaultMessage: 'Switch' })}
            name='switchId'
            rules={[
              { required: true }]}
            initialValue={null}
          >
            <Select
              onChange={(e)=> { setSwitchId(e) }}
              options={[{
                label: $t({ defaultMessage: 'Select Switch...' }),
                value: null
              },
              ...switchOption
              ]}
            />
          </Form.Item> }

          <Form.Item
            label={$t({ defaultMessage: 'VLAN ID' })}
            name='vlanId'
            rules={[
              { required: true }]}
            initialValue={null}
          >
            <Select
              onChange={(e) => {
                e && form.resetFields(['veId'])
                form.setFieldValue('veId', e || '')
              }}
              disabled={isEditMode || (isVenueLevel && !switchId) || isIncludeIpSetting || readOnly}
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
            {/* <span style={{
              display: 'flex',
              fontSize: 'var(--acx-body-3-font-size)',
              lineHeight: '32px'
            }}>
          VE- */}
            <InputNumber
              disabled={isEditMode || readOnly}
              style={{ marginLeft: '5px' }}
              min={1}
              max={4095}
            />
            {/* </span> */}
          </Form.Item>


          <Form.Item
            label={$t({ defaultMessage: 'VE Name' })}
            name='name'
            initialValue={''}
            rules={[
              { validator: (_, value) => NameRegExp(value) }
            ]}
          >
            <Input disabled={readOnly} />
          </Form.Item>


          <Form.Item
            label={$t({ defaultMessage: 'OSPF Area' })}
            name='ospfArea'
            initialValue={''}
            rules={[
              { validator: (_, value) => OspfRegExp(value) }
            ]}
          >
            <Input disabled={readOnly} />
          </Form.Item>


          <Form.Item
            label={$t({ defaultMessage: 'DHCP Relay Agent' })}
            name='dhcpRelayAgent'
            initialValue={''}
            rules={[
              { validator: (_, value) => DhcpRelayAgentRegExp(value) }
            ]}
          >
            <Input disabled={readOnly} />
          </Form.Item>


          {(isIncludeIpSetting && isEditMode) &&
            <Form.Item
              label={$t({ defaultMessage: 'IP Assignment' })}
              name='ipAddressType'
            >
              <Radio.Group
                onChange={onIpAddressTypeChange} >
                <Space direction='vertical'>
                  <Radio key='dynamic'
                    value='dynamic'
                    disabled={readOnly}>
                    {$t({ defaultMessage: 'DHCP' })}
                  </Radio>
                  <Radio key='static'
                    value='static'
                    disabled={readOnly || (!enableDhcp && dhcpServerEnabled) || disableIpSetting}>
                    {$t({ defaultMessage: 'Static/Manual' })}
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          }

          <Form.Item
            label={$t({ defaultMessage: 'IP Address' })}
            name='ipAddress'
            initialValue={''}
            rules={[
              { required: true },
              { validator: (_, value) => IpAddressRegExp(value) }
            ]}
          >
            <Input
              disabled={readOnly || enableDhcp || disableIpSetting} />
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
            <Input disabled={readOnly || enableDhcp || disableIpSetting} />
          </Form.Item>

          <Form.Item
            label={$t({ defaultMessage: 'Ingress ACL' })}
            name='ingressAcl'
            initialValue={''}
          >
            <Select
              disabled={readOnly}
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
              disabled={readOnly}
              options={[
                {
                  label: $t({ defaultMessage: 'NONE' }),
                  value: ''
                },
                ...aclOption
              ]}
            />
          </Form.Item>

        </Form>
      </>}
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
  const re = new RegExp(/^([0-9]|[1-8][0-9]|9[0-9]|1[0-9]{2}|2[01][0-9]|22[0-3])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){3}$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ipAddress))
  }
  return Promise.resolve()
}

function OspfRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/(^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){3}$)|(^[0-9]*$)/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.ospf))
  }
  return Promise.resolve()
}

function DhcpRelayAgentRegExp (value: string) {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){2}\.([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.dhcpRelayAgent))
  }
  return Promise.resolve()
}
