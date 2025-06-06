import { useCallback, useEffect, useMemo, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space } from 'antd'
import { CheckboxChangeEvent }                               from 'antd/lib/checkbox'
import { useIntl }                                           from 'react-intl'

import { Alert, Drawer, useStepFormContext }                                                             from '@acx-ui/components'
import { Features }                                                                                      from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  EdgeIpModeEnum,
  EdgePortInfo,
  EdgePortTypeEnum,
  IncompatibilityFeatures,
  SubInterface,
  edgePortIpValidator,
  generalSubnetMskRegExp,
  interfaceSubnetValidator,
  serverIpAddressRegExp,
  validateGatewayInSubnet
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { SubInterfaceSettingsFormType } from './types'
import {
  extractSubnetFromEdgePortInfo,
  extractSubnetFromSubInterface
} from './utils'

interface SubInterfaceDrawerProps {
  serialNumber: string
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: SubInterface
  handleAdd: (data: SubInterface) => void
  handleUpdate: (data: SubInterface) => void
  allSubInterfaceVlans: { id: String, vlan: number }[]
  allInterface?: EdgePortInfo[]
  isSdLanRun?: boolean
  currentInterfaceName?: string
  isSupportAccessPort?: boolean
}

const getPortTypeOptions = () => {
  const { $t } = getIntl()
  return [
    { label: $t({ defaultMessage: 'LAN' }), value: EdgePortTypeEnum.LAN }
  ]
}

const getIpModeOptions = () => {
  const { $t } = getIntl()
  return [
    { label: $t({ defaultMessage: 'DHCP' }), value: EdgeIpModeEnum.DHCP },
    { label: $t({ defaultMessage: 'Static IP' }), value: EdgeIpModeEnum.STATIC }
  ]
}

const SubInterfaceDrawer = (props: SubInterfaceDrawerProps) => {

  const { $t } = useIntl()
  const {
    visible, setVisible, data, handleAdd, handleUpdate, allInterface = [],
    isSdLanRun, serialNumber, currentInterfaceName, isSupportAccessPort
  } = props
  const [formRef] = Form.useForm()
  const { form: stepFormRef } = useStepFormContext<SubInterfaceSettingsFormType>()
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const corePortEnabled = Form.useWatch('corePortEnabled', formRef)
  const accessPortEnabled = Form.useWatch('accessPortEnabled', formRef)
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures>()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue(data)
    }
  }, [visible, formRef, data])

  const getAllSubInterfacesFromForm = useCallback(() => {
    const value = stepFormRef?.getFieldsValue(true) as SubInterfaceSettingsFormType
    const portsSubInterfaces = Object.values(value?.portSubInterfaces[props.serialNumber] || {})
      .flat() as SubInterface[]
    const lagsSubInterfaces = Object.values(value?.lagSubInterfaces[props.serialNumber] || {})
      .flat() as SubInterface[]
    return [...portsSubInterfaces, ...lagsSubInterfaces]
  }, [stepFormRef, props.serialNumber])

  const handleCorePortChange = (e: CheckboxChangeEvent) => {
    if(!isSupportAccessPort) {
      formRef.setFieldValue('accessPortEnabled', e.target.checked)
    }
  }

  const { isPortEnabled, hasWanPort, hasCorePort, hasAccessPort } = useMemo(() => {
    let isPortEnabled = false
    let hasWanPort = false
    let hasCorePort = false
    let hasAccessPort = false
    const allSubInterfaces = getAllSubInterfacesFromForm()
    allInterface.forEach(item => {
      if(
        item.serialNumber === serialNumber && item.portName === currentInterfaceName &&
        item.portType !== EdgePortTypeEnum.UNCONFIGURED
      ) {
        isPortEnabled = item.portEnabled
      }
      if(item.portType === EdgePortTypeEnum.WAN && item.portEnabled && !item.isLagMember) {
        hasWanPort = true
      }
      if(item.isCorePort) {
        hasCorePort = true
      }
      if(item.isAccessPort) {
        hasAccessPort = true
      }
    })
    allSubInterfaces.forEach(item => {
      if(item.corePortEnabled) {
        hasCorePort = true
      }
      if(item.accessPortEnabled) {
        hasAccessPort = true
      }
    })
    return {
      isPortEnabled,
      hasWanPort,
      hasCorePort,
      hasAccessPort
    }
  }, [allInterface, currentInterfaceName, serialNumber, getAllSubInterfacesFromForm])

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Sub-interface' },
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
    const formData = formRef.getFieldsValue(true)
    const { id, ip, subnet, ...rest } = formData
    const payload = {
      ...rest,
      ...(
        rest.ipMode === EdgeIpModeEnum.STATIC ?
          { ip, subnet } : {}
      ),
      id: id ? id : 'new_' + Date.now()
    }

    try {
      if(data) {
        handleUpdate(payload)
      } else {
        handleAdd(payload)
      }
    } catch (error) {
      // TODO error message not be defined
    }
    handleClose()
  }

  const validateVlanDuplication = (vlan: number) => {
    const duplicate = props.data ?
      props.allSubInterfaceVlans.find(item => item.vlan === vlan && item.id !== props.data?.id) :
      props.allSubInterfaceVlans.find(item => item.vlan === vlan)

    return duplicate ?
      Promise.reject($t({ defaultMessage: 'VLAN should be unique' })) :
      Promise.resolve()
  }

  const getCurrentSubnetInfo = () => {
    const { ipMode, ip, subnet } = formRef.getFieldsValue(true)
    return { ipMode, ip, subnetMask: subnet }
  }

  const getSubnetInfoWithoutCurrent = () => {
    const currentSubInterfaceId = formRef.getFieldValue('id') || ''

    const allPhysicalInterfaceSubnets = (allInterface
      ?.map(item => extractSubnetFromEdgePortInfo(item))
      // eslint-disable-next-line max-len
      .filter(Boolean) as { id?: string, ipMode: EdgeIpModeEnum, ip: string, subnetMask: string }[]) ?? []

    const allSubInterfaceSubnets = getAllSubInterfacesFromForm()
      .filter(item => item.id !== currentSubInterfaceId)
      .map(item => extractSubnetFromSubInterface(item))
      .filter(Boolean) as { ipMode: EdgeIpModeEnum, ip: string, subnetMask: string }[]

    return [...allPhysicalInterfaceSubnets, ...allSubInterfaceSubnets]
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      name='portType'
      initialValue={EdgePortTypeEnum.LAN}
      label={$t({ defaultMessage: 'Port Type' })}
      rules={[{ required: true }]}
      children={<Select options={getPortTypeOptions()} />}
    />
    <Form.Item
      name='ipMode'
      initialValue={EdgeIpModeEnum.DHCP}
      label={$t({ defaultMessage: 'IP Assignment Type' })}
      rules={[{ required: true }]}
      children={<Select options={getIpModeOptions()} />}
    />
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => prev.ipMode !== cur.ipMode}
    >
      {({ getFieldValue }) =>
        getFieldValue('ipMode') === EdgeIpModeEnum.DHCP ? (
          <Alert message={
            $t({ defaultMessage: `Note: Do not add default route pointing 
              to default gateway provided by server.` })
          }
          type='info'
          />
        ) : null
      }
    </Form.Item>
    {
      isEdgeCoreAccessSeparationReady && <Form.Item
        label={$t({ defaultMessage: 'Use port as…' })}
        children={
          <Space direction='vertical'>
            <Form.Item
              name='corePortEnabled'
              valuePropName='checked'
              noStyle
            >
              <Checkbox
                children={$t({ defaultMessage: 'Core port' })}
                onChange={handleCorePortChange}
                disabled={
                  !isPortEnabled || hasWanPort || (hasCorePort && !corePortEnabled) ||
                  isSdLanRun
                }
              />
            </Form.Item>
            <Space size={0}>
              <Form.Item
                name='accessPortEnabled'
                valuePropName='checked'
                noStyle
              >
                <Checkbox
                  children={$t({ defaultMessage: 'Access port' })}
                  disabled={
                    !isPortEnabled || hasWanPort || (hasAccessPort && !accessPortEnabled) ||
                  isSdLanRun || !isSupportAccessPort
                  }
                />
              </Form.Item>
              <ApCompatibilityToolTip
                title=''
                showDetailButton
                // eslint-disable-next-line max-len
                onClick={() => setEdgeFeatureName(IncompatibilityFeatures.CORE_ACCESS_SEPARATION)}
              />
            </Space>
          </Space>
        }
      />
    }
    <Form.Item
      noStyle
      shouldUpdate={(prev, cur) => prev.ipMode !== cur.ipMode
        || prev.accessPortEnabled !== cur.accessPortEnabled
      }
    >
      {({ getFieldValue }) =>
        getFieldValue('ipMode') === EdgeIpModeEnum.STATIC ? (
          <>
            <Form.Item
              name='ip'
              label={$t({ defaultMessage: 'IP Address' })}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) => edgePortIpValidator(value, getFieldValue('subnet')) },
                {
                  validator: () =>
                    // eslint-disable-next-line max-len
                    interfaceSubnetValidator(getCurrentSubnetInfo(), getSubnetInfoWithoutCurrent().filter(item => item.ipMode === EdgeIpModeEnum.STATIC))
                }
              ]}
              children={<Input />}
              dependencies={['subnet']}
            />
            <Form.Item
              name='subnet'
              label={$t({ defaultMessage: 'Subnet Mask' })}
              rules={[
                { required: true },
                { validator: (_, value) => generalSubnetMskRegExp(value) }
              ]}
              children={<Input />}
            />
            {
              (isEdgeCoreAccessSeparationReady && getFieldValue('accessPortEnabled')) ?
                <Form.Item
                  name='gateway'
                  label={$t({ defaultMessage: 'Gateway' })}
                  validateFirst
                  rules={[
                    { required: true },
                    { validator: (_, value) => serverIpAddressRegExp(value) },
                    {
                      validator: (_, value) => {
                        let subnet = getCurrentSubnetInfo()
                        return validateGatewayInSubnet(subnet.ip, subnet.subnetMask, value)
                      }
                    }
                  ]}
                  children={<Input />}
                /> : null
            }
          </>
        ) : null
      }
    </Form.Item>
    <Form.Item
      name='vlan'
      label={$t({ defaultMessage: 'VLAN' })}
      rules={[
        { required: true },
        {
          type: 'number',
          min: 1,
          max: 4094,
          message: $t(validationMessages.vlanRange)
        },
        { validator: (_, value) => validateVlanDuplication(value) }
      ]}
      children={<InputNumber min={1} max={4094} />}
    />
    <EdgeCompatibilityDrawer
      visible={!!edgeFeatureName}
      type={EdgeCompatibilityType.ALONE}
      title={$t({ defaultMessage: 'Compatibility Requirement' })}
      featureName={edgeFeatureName}
      onClose={() => setEdgeFeatureName(undefined)}
    />
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

export default SubInterfaceDrawer