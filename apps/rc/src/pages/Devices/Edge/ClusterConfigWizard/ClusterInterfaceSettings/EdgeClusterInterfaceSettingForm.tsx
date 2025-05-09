import { useContext } from 'react'

import { Col, Form, FormInstance, Input, Radio, Row, Space } from 'antd'
import _                                                     from 'lodash'
import { useIntl }                                           from 'react-intl'

import { Select, StepsForm, Tooltip } from '@acx-ui/components'
import {
  ClusterNetworkSettings,
  EdgeIpModeEnum,
  EdgePortInfo,
  EdgePortTypeEnum,
  edgePortIpValidator,
  getEdgePortIpFromStatusIp,
  isInterfaceInVRRPSetting,
  optionSorter,
  subnetMaskIpRegExp,
  validateClusterInterface,
  validateConfiguredSubnetIsConsistent,
  validateUniqueIp
} from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

interface EdgeClusterInterfaceSettingFormProps {
  form: FormInstance
  interfaceList?: EdgePortInfo[]
  rootNamePath?: string[]
  serialNumber: string
  vipConfig?: ClusterNetworkSettings['virtualIpSettings']
}

export interface EdgeClusterInterfaceSettingFormType {
  interfaceName: string
  ipMode: EdgeIpModeEnum
  ip: string
  subnet: string
}

export const EdgeClusterInterfaceSettingForm = (props: EdgeClusterInterfaceSettingFormProps) => {
  const {
    form, interfaceList, rootNamePath = [],
    serialNumber, vipConfig = []
  } = props
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const { $t } = useIntl()

  const interfaceOptions = interfaceList?.filter(item =>
    !item.portName.includes('.') &&
    !item.isCorePort &&
    !item.isLagMember &&
    item.portType !== EdgePortTypeEnum.WAN
  )?.map(item =>
    ({
      label: _.capitalize(item.portName),
      value: item.portName
    })).sort(optionSorter)

  const handleInterfaceChange = (value: string) => {
    const currentInterface = interfaceList?.find(item => item.portName === value)
    form.setFieldValue(rootNamePath.concat('ip'), getEdgePortIpFromStatusIp(currentInterface?.ip))
    form.setFieldValue(rootNamePath.concat('subnet'), currentInterface?.subnet)
  }

  const getCurrentSubnetInfo = () => {
    return {
      ip: form.getFieldValue(rootNamePath.concat('ip')),
      subnetMask: form.getFieldValue(rootNamePath.concat('subnet'))
    }
  }

  const getAllNodesSubnetInfo = () => {
    const allSubnetInfo = Object.values(form.getFieldsValue(true))
      .filter(item =>
        (item as EdgeClusterInterfaceSettingFormType).ipMode === EdgeIpModeEnum.STATIC
      ).map(item => {
        return {
          ip: (item as EdgeClusterInterfaceSettingFormType).ip,
          subnet: (item as EdgeClusterInterfaceSettingFormType).subnet
        }
      })
    return allSubnetInfo
  }

  const getAllNodesIp = () => {
    return getAllNodesSubnetInfo().map(item => item.ip ?? '')
  }

  const getAllNodesClusterInterfaceName = () => {
    return Object.values(form.getFieldsValue(true))
      ?.map(item => (item as EdgeClusterInterfaceSettingFormType).interfaceName) ?? []
  }

  return(
    <>
      <Row>
        <Col span={12}>
          <Form.Item
            name={rootNamePath.concat('interfaceName')}
            label={
              <>
                {$t({ defaultMessage: 'Set cluster interface on:' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: `The cluster interfaces for all nodes need to be 
                the same interface type, either physical port or LAG` })}
                  placement='bottom'
                />
              </>
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select an interface as cluster interface' })
            }]}
            children={
              <Select
                onChange={handleInterfaceChange}
              >
                {
                  interfaceOptions?.map(item => (
                    isInterfaceInVRRPSetting(serialNumber, item.value, vipConfig) ?
                      <Select.Option
                        key={item.value}
                        value={item.value}
                        // eslint-disable-next-line max-len
                        title={$t({ defaultMessage: 'This interface has already been configured as a VRRP interface' })}
                        children={item.label}
                        disabled
                      />
                      :
                      <Select.Option
                        key={item.value}
                        value={item.value}
                        children={item.label}
                      />
                  ))
                }
              </Select>
            }
          />
        </Col>
      </Row>
      <StepsForm.Title children={$t({ defaultMessage: 'IP Settings' })} />

      <Form.Item
        name={rootNamePath.concat('ipMode')}
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
      <Form.Item
        noStyle
        shouldUpdate={(prev, current) => {
          const targetFieldPath = rootNamePath.concat('ipMode')
          return _.get(prev, targetFieldPath) !== _.get(current, targetFieldPath)
        }}
      >
        {({ getFieldValue }) => {
          const ipMode = getFieldValue(rootNamePath.concat('ipMode'))

          return ipMode === EdgeIpModeEnum.STATIC
            ? <><Row>
              <Col span={16}>
                <Form.Item
                  name={rootNamePath.concat('ip')}
                  label={$t({ defaultMessage: 'IP Address' })}
                  dependencies={clusterInfo?.edgeList?.map(node =>
                    [node.serialNumber].concat('subnet'))}
                  rules={[
                    { required: true },
                    { validator: (_, value) =>
                      edgePortIpValidator(value, getCurrentSubnetInfo().subnetMask)
                    },
                    {
                      validator: (_, value) =>
                        validateConfiguredSubnetIsConsistent(getAllNodesSubnetInfo(), value)
                    },
                    {
                      validator: (_, value) =>
                        validateUniqueIp(getAllNodesIp(), value)
                    }
                  ]}
                  children={<Input />}
                  validateFirst
                />
              </Col>
            </Row>
            <Row>
              <Col span={16}>
                <Form.Item
                  name={rootNamePath.concat('subnet')}
                  label={$t({ defaultMessage: 'Subnet Mask' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) => subnetMaskIpRegExp(value) }
                  ]}
                  children={<Input />}
                />
              </Col>
            </Row>
            </>
            : ''
        }}
      </Form.Item>
      <Row>
        <Col span={24}>
          <Form.Item
            name={rootNamePath.concat('validate')}
            rules={[
              { validator: () =>
                validateClusterInterface(getAllNodesClusterInterfaceName()) }
            ]}
            children={<Input hidden />}
          />
        </Col>
      </Row>
    </>
  )
}
