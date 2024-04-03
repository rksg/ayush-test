import { useContext } from 'react'

import { Col, Form, FormInstance, Input, Radio, Row, Space } from 'antd'
import _                                                     from 'lodash'
import { useIntl }                                           from 'react-intl'

import { Select, StepsForm, Tooltip } from '@acx-ui/components'
import {
  EdgeIpModeEnum,
  EdgePortInfo,
  EdgePortTypeEnum,
  edgePortIpValidator,
  getEdgePortIpFromStatusIp,
  optionSorter,
  subnetMaskIpRegExp,
  validateClusterInterface,
  validateSubnetIsConsistent,
  validateUniqueIp
} from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

interface EdgeClusterInterfaceSettingFormProps {
  form: FormInstance
  interfaceList?: EdgePortInfo[]
  rootNamePath?: string[]
}

export interface EdgeClusterInterfaceSettingFormType {
  interfaceName: string
  ipMode: EdgeIpModeEnum
  ip: string
  subnet: string
}

export const EdgeClusterInterfaceSettingForm = (props: EdgeClusterInterfaceSettingFormProps) => {
  const { form, interfaceList, rootNamePath = [] } = props
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
      .map(item => {
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
            rules={[{ required: true }]}
            children={
              <Select
                onChange={handleInterfaceChange}
                options={interfaceOptions}
              />
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
                        validateSubnetIsConsistent(getAllNodesSubnetInfo(), value),
                      message: $t({ defaultMessage: `The ip setting is not 
                      in the same subnet as other nodes.` })
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
