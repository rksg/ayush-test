import { useContext, useEffect, useMemo, useState } from 'react'

import { Checkbox, Form, Input, InputNumber, Select, Space } from 'antd'
import { CheckboxChangeEvent }                               from 'antd/lib/checkbox'
import { useWatch }                                          from 'antd/lib/form/Form'
import { useIntl }                                           from 'react-intl'

import { Alert, Drawer }                                                                                                                                                                                      from '@acx-ui/components'
import { Features }                                                                                                                                                                                           from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType, useIsEdgeFeatureReady }                                                                                                      from '@acx-ui/rc/components'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeSubInterface, IncompatibilityFeatures, edgePortIpValidator, generalSubnetMskRegExp, getEdgeWanInterfaceCount, serverIpAddressRegExp, validateGatewayInSubnet } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }                                                                                                                                                                        from '@acx-ui/utils'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

interface SubInterfaceDrawerProps {
  mac: string
  visible: boolean
  setVisible: (visible: boolean) => void
  data?: EdgeSubInterface
  handleAdd: (data: EdgeSubInterface) => Promise<unknown>
  handleUpdate: (data: EdgeSubInterface) => Promise<unknown>
  portId?: string
  lagId?: number
  allSubInterfaces?: EdgeSubInterface[]
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
    mac, visible, setVisible, data, handleAdd, handleUpdate, portId, lagId, allSubInterfaces,
    isSupportAccessPort
  } = props
  const [formRef] = Form.useForm()
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const { portData, lagData, edgeSdLanData } = useContext(EditEdgeDataContext)
  const corePortEnabled = useWatch('corePortEnabled', formRef)
  const accessPortEnabled = useWatch('accessPortEnabled', formRef)
  const [edgeFeatureName, setEdgeFeatureName] = useState<IncompatibilityFeatures>()

  useEffect(() => {
    if(visible) {
      formRef.resetFields()
      formRef.setFieldsValue(data)
    }
  }, [visible, formRef, data])

  const { isPortEnabled, hasCorePort, hasAccessPort } = useMemo(() => {
    let isPortEnabled = false
    const hasCorePort = portData?.some(p => p.corePortEnabled) ||
      lagData?.some(l => l.corePortEnabled) || allSubInterfaces?.some(s => s.corePortEnabled)
    const hasAccessPort = portData?.some(p => p.accessPortEnabled) ||
      lagData?.some(l => l.accessPortEnabled) || allSubInterfaces?.some(s => s.accessPortEnabled)
    if(portId !== undefined) {
      const port = portData?.find(p => p.id === portId)
      isPortEnabled = port?.enabled ?? false
    } else if(lagId !== undefined) {
      const lag = lagData?.find(l => l.id === lagId)
      isPortEnabled = lag?.lagEnabled ?? false
    }
    return {
      isPortEnabled,
      hasCorePort,
      hasAccessPort
    }
  }, [portData, lagData, portId, lagId, allSubInterfaces])

  const hasWanPort = getEdgeWanInterfaceCount(portData, lagData) > 0
  const isSdLanRun = !!edgeSdLanData

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} Sub-interface' },
      { operation: data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const getCurrentSubnetInfo = () => {
    const { ipMode, ip, subnet } = formRef.getFieldsValue(true)
    return { ipMode, ip, subnetMask: subnet }
  }

  const handleCorePortChange = (e: CheckboxChangeEvent) => {
    if(!isSupportAccessPort) {
      formRef.setFieldValue('accessPortEnabled', e.target.checked)
    }
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    formRef.submit()
  }

  const handleFinish = async () => {
    const formData = formRef.getFieldsValue(true)
    const { ip, subnet, ...rest } = formData
    const payload = {
      ...rest,
      ...(
        rest.ipMode === EdgeIpModeEnum.STATIC ?
          { ip, subnet } : {}
      ),
      name: data?.name || '',
      mac: mac,
      enabled: true
    }

    try {
      if(data) {
        await handleUpdate(payload)
      } else {
        await handleAdd(payload)
      }
    } catch (error) {
      // TODO error message not be defined
      console.log(error) // eslint-disable-line no-console
    }
    handleClose()
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
      shouldUpdate={(prev, cur) => prev.ipMode !== cur.ipMode ||
        prev.accessPortEnabled !== cur.accessPortEnabled}
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
                { validator: (_, value) => edgePortIpValidator(value, getFieldValue('subnet')) }
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
        }
      ]}
      children={<InputNumber />}
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