import { useEffect, useState } from 'react'

import { Checkbox, Form, Input, Radio, Select, Space, Switch } from 'antd'
import TextArea                                                from 'antd/lib/input/TextArea'
import _                                                       from 'lodash'
import { useIntl }                                             from 'react-intl'
import { useParams }                                           from 'react-router-dom'

import { Drawer, StepsForm, showActionModal }              from '@acx-ui/components'
import { useAddEdgeLagMutation, useUpdateEdgeLagMutation } from '@acx-ui/rc/services'
import {
  EdgeIpModeEnum,
  EdgeLag,
  EdgeLagLacpModeEnum,
  EdgeLagTimeoutEnum,
  EdgeLagTypeEnum,
  EdgePort,
  EdgePortTypeEnum,
  edgePortIpValidator,
  serverIpAddressRegExp,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'

interface LagDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: EdgeLag
  portList?: EdgePort[]
  existedLagList?: EdgeLag[]
}

export const LagDrawer = (props: LagDrawerProps) => {

  const { visible, setVisible, data, portList, existedLagList } = props
  const isEditMode = data?.id !== undefined
  const { serialNumber } = useParams()
  const { $t } = useIntl()
  const [formRef] = Form.useForm()
  const [enabledPorts, setEnabledPorts] = useState<string[]>()
  const ipMode = Form.useWatch('ipMode', formRef)
  const subnet = Form.useWatch('subnet', formRef)
  const lagMembers = Form.useWatch('lagMembers', formRef) as string[]
  const [addEdgeLag] = useAddEdgeLagMutation()
  const [updateEdgeLag] = useUpdateEdgeLagMutation()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue({
        ...data,
        lagMembers: data?.lagMembers.map(item => item.portId)
      })
      setEnabledPorts(data?.lagMembers.filter(item => item.portEnabled)
        .map(item => item.portId))
    }
  }, [visible, formRef, data])

  const lagNameOptions = [
    { label: 0,value: 0 },
    { label: 1,value: 1 },
    { label: 2,value: 2 },
    { label: 3,value: 3 }
  ]

  const lagTypeOptions = [
    {
      label: $t({ defaultMessage: 'LACP (Dynamic)' }),
      value: EdgeLagTypeEnum.LACP
    }
  ]

  const modeOptions = [
    {
      label: $t({ defaultMessage: 'Active' }),
      value: EdgeLagLacpModeEnum.ACTIVE
    },
    {
      label: $t({ defaultMessage: 'Passive' }),
      value: EdgeLagLacpModeEnum.PASSIVE
    }
  ]

  const timeoutOptions = [
    {
      label: $t({ defaultMessage: 'Short' }),
      value: EdgeLagTimeoutEnum.SHORT
    },
    {
      label: $t({ defaultMessage: 'Long' }),
      value: EdgeLagTimeoutEnum.LONG
    }
  ]

  const portTypeOptions = [
    {
      label: $t({ defaultMessage: 'WAN' }),
      value: EdgePortTypeEnum.WAN
    },
    {
      label: $t({ defaultMessage: 'LAN' }),
      value: EdgePortTypeEnum.LAN
    }
  ]

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} LAG' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    formRef.submit()
  }

  const handleFinish = async () => {
    try {
      const formData = formRef.getFieldsValue(true)
      const payload = {
        ...formData,
        lagMembers: formData.lagMembers?.map((item: string) => ({
          portId: item,
          portEnabled: enabledPorts?.includes(item) ?? false
        })) ?? []
      }
      const requestPayload = {
        params: { serialNumber, lagId: formData.id.toString() },
        payload: payload
      }
      if(data) {
        delete requestPayload.payload.id
        await updateEdgeLag(requestPayload).unwrap()
        handleClose()
      } else {
        const portConfig = portList?.find(item => formData.lagMembers?.includes(item.id))
        if(portConfig?.portType === EdgePortTypeEnum.WAN ||
          portConfig?.portType === EdgePortTypeEnum.LAN) {
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Existing Port Configuration Clean-up' }),
            content: $t({
              defaultMessage: `Existing configurations have been detected on the selected ports.
              Please be aware that, to integrate them into the LAG,
              we will replace the current configurations with LAG settings.
              Are you sure you want to proceed?`
            }),
            okText: $t({ defaultMessage: 'Replace with LAG settings' }),
            onOk: async () => {
              await addEdgeLag(requestPayload).unwrap()
              handleClose()
            }
          })
        } else {
          await addEdgeLag(requestPayload).unwrap()
          handleClose()
        }
      }
    } catch (error) {
      // TODO error message not be defined
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handlePortEnabled = (portId: string, enabled: boolean) => {
    if(enabled) {
      setEnabledPorts([...(enabledPorts ?? []), portId])
    } else {
      setEnabledPorts(enabledPorts?.filter(item => item !== portId))
    }
  }

  const getUseableLagOptions = (existedLagList?: EdgeLag[]) => {
    return lagNameOptions.filter(option =>
      !existedLagList?.some(existedLag =>
        existedLag.id === option.value &&
        existedLag.id !== data?.id)) // keep the edit mode data as a selection
  }

  const getUseableLagMembers = (portList?: EdgePort[]) => {
    return portList?.filter(port =>
      !existedLagList?.some(exsistedLag =>
        exsistedLag.lagMembers?.some(existedLagMember =>
          existedLagMember.portId === port.id &&
          !data?.lagMembers.some(editLagMember =>
            editLagMember.portId === port.id)))) // keep the edit mode data as a selection
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      label={$t({ defaultMessage: 'LAG Name' })}
    >
      <Space>
        <span>LAG</span>
        <Form.Item
          name='id'
          rules={[{
            required: true,
            message: $t({ defaultMessage: 'Please enter LAG Name' })
          }]}
          children={<Select options={getUseableLagOptions(existedLagList)} disabled={isEditMode} />}
          noStyle
          hasFeedback
        />
      </Space>
    </Form.Item>
    <Form.Item
      name='description'
      label={$t({ defaultMessage: 'Description' })}
      rules={[
        { max: 63 }
      ]}
      children={<TextArea />}
    />
    <Form.Item
      name='lagType'
      initialValue={EdgeLagTypeEnum.LACP}
      label={$t({ defaultMessage: 'LAG Type' })}
      rules={[{ required: true }]}
      children={<Select options={lagTypeOptions} disabled />}
    />
    <Form.Item
      name='lacpMode'
      initialValue={EdgeLagLacpModeEnum.ACTIVE}
      label={$t({ defaultMessage: 'Mode' })}
      rules={[{ required: true }]}
      children={<Select options={modeOptions} />}
    />
    <Form.Item
      name='lacpTimeout'
      initialValue={EdgeLagTimeoutEnum.SHORT}
      label={$t({ defaultMessage: 'Timeout' })}
      rules={[{ required: true }]}
      children={<Select options={timeoutOptions} />}
    />
    <Form.Item
      name='lagMembers'
      label={$t({ defaultMessage: 'Select LAG members:' })}
      children={<Checkbox.Group>
        {
          <Space direction='vertical'>
            {
              getUseableLagMembers(portList)?.map((item) =>
                (
                  <Space key={`${item.id}_space`} size={30}>
                    <Checkbox
                      key={`${item.id}_checkbox`}
                      value={item.id}
                      children={_.capitalize(item.interfaceName)}
                    />
                    {
                      lagMembers?.some(id => id === item.id) &&
                    <StepsForm.FieldLabel width='100px'>
                      <div style={{ margin: 'auto' }}>{$t({ defaultMessage: 'Port Enabled' })}</div>
                      <Form.Item
                        children={<Switch
                          checked={enabledPorts?.includes(item.id)}
                          onChange={(checked) => handlePortEnabled(item.id, checked)}
                        />}
                        noStyle
                      />
                    </StepsForm.FieldLabel>
                    }
                  </Space>
                ))
            }
          </Space>
        }
      </Checkbox.Group>}
    />
    <Form.Item
      name='portType'
      initialValue={EdgePortTypeEnum.WAN}
      label={$t({ defaultMessage: 'Port Type' })}
      children={<Select options={portTypeOptions} />}
    />
    <Form.Item
      initialValue={false}
      name='corePortEnabled'
      valuePropName='checked'
      children={<Checkbox children={
        $t({ defaultMessage: 'Use this LAG as Core LAG' })
      } />}
    />
    <StepsForm.Title children={$t({ defaultMessage: 'IP Settings' })} />
    <Form.Item
      name='ipMode'
      initialValue={EdgeIpModeEnum.DHCP}
      label={$t({ defaultMessage: 'IP Assignment' })}
      validateFirst
      rules={[{
        required: true
      }]}
      children={
        <Radio.Group>
          <Space direction='vertical'>
            <Radio value={EdgeIpModeEnum.DHCP}>
              {$t({ defaultMessage: 'DHCP' })}
            </Radio>
            <Radio value={EdgeIpModeEnum.STATIC}>
              {$t({ defaultMessage: 'Static/Manual' })}
            </Radio>
          </Space>
        </Radio.Group>
      }
    />
    {
      ipMode === EdgeIpModeEnum.STATIC &&
        <>
          <Form.Item
            name='ip'
            label={$t({ defaultMessage: 'IP Address' })}
            rules={[
              { required: true },
              { validator: (_, value) =>
                edgePortIpValidator(value, subnet)
              }
            ]}
            children={<Input />}
            validateFirst
          />
          <Form.Item
            name={'subnet'}
            label={$t({ defaultMessage: 'Subnet Mask' })}
            validateFirst
            rules={[
              { required: true },
              { validator: (_, value) => subnetMaskIpRegExp(value) }
            ]}
            children={<Input />}
          />
          <Form.Item
            name={'gateway'}
            label={$t({ defaultMessage: 'Gateway' })}
            rules={[
              { required: true },
              { validator: (_, value) => serverIpAddressRegExp(value) }
            ]}
            children={<Input />}
            validateFirst
          />
        </>
    }
    <StepsForm.FieldLabel width='120px'>
      {$t({ defaultMessage: 'Enable NAT' })}
      <Form.Item
        initialValue={false}
        name='natEnabled'
        valuePropName='checked'
        children={<Switch />}
      />
    </StepsForm.FieldLabel>
    <StepsForm.FieldLabel width='120px'>
      {$t({ defaultMessage: 'LAG Enabled' })}
      <Form.Item
        initialValue={false}
        name='lagEnabled'
        valuePropName='checked'
        children={<Switch />}
      />
    </StepsForm.FieldLabel>
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: !!data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={getTitle()}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
    />
  )
}