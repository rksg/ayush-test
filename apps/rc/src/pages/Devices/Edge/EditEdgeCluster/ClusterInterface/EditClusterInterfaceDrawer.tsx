import { useEffect } from 'react'

import { Col, Form, Input, Radio, Row, Space } from 'antd'
import _                                       from 'lodash'
import { useIntl }                             from 'react-intl'

import { Drawer, Select, StepsForm, Tooltip } from '@acx-ui/components'
import {
  EdgeIpModeEnum,
  EdgePortInfo,
  EdgePortTypeEnum,
  edgePortIpValidator,
  optionSorter,
  subnetMaskIpRegExp,
  validateUniqueIp
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import { ClusterInterfaceTableType } from '.'

interface EditClusterInterfaceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  handleFinish: (data: ClusterInterfaceTableType) => void
  interfaceList?: EdgePortInfo[]
  editData?: ClusterInterfaceTableType
  allNodeData?: ClusterInterfaceTableType[]
}

export const EditClusterInterfaceDrawer = (props: EditClusterInterfaceDrawerProps) => {
  const {
    visible, setVisible, handleFinish: finish, interfaceList, editData,
    allNodeData
  } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible){
      form.setFieldsValue({
        ...editData,
        ip: editData?.ip?.split('/')[0]
      })
    }
  }, [editData])

  const interfaceOprionts = interfaceList?.filter(item =>
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
    form.setFieldValue('ip', currentInterface?.ip?.split('/')[0])
    form.setFieldValue('subnet', currentInterface?.subnet)
  }

  const getCurrentSubnetInfo = () => {
    return {
      ip: form.getFieldValue('ip'),
      subnetMask: form.getFieldValue('subnet')
    }
  }

  const getAllNodesSubnetInfo = () => {
    const allSubnetInfo = allNodeData?.filter(item =>
      item.serialNumber !== editData?.serialNumber)
      .map(item => ({ ip: item.ip, subnet: item.subnet })) ?? []
    allSubnetInfo?.push({
      ip: form.getFieldValue('ip'),
      subnet: form.getFieldValue('subnet')
    })
    return allSubnetInfo
  }

  const getAllNodesIp = () => {
    return getAllNodesSubnetInfo().map(item => item.ip ?? '')
  }

  const handleClose = () => {
    setVisible(false)
  }

  const handleFinish = () => {
    finish(form.getFieldsValue(true))
    setVisible(false)
  }

  const handleSave = async () => {
    form.submit()
  }

  const drawerContent = (
    <Form
      form={form}
      onFinish={handleFinish}
      layout='vertical'
    >
      <Row>
        <Col span={12}>
          <Form.Item
            name='interfaceName'
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
                options={interfaceOprionts}
              />
            }
          />
        </Col>
      </Row>

      <StepsForm.Title children={$t({ defaultMessage: 'IP Settings' })} />

      <UI.StyledFormItem
        name='ipMode'
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
          return prev.ipMode !== current.ipMode
        }}
      >
        {({ getFieldValue }) => {
          const ipMode = getFieldValue('ipMode')

          return ipMode === EdgeIpModeEnum.STATIC
            ? <><Row>
              <Col span={16}>
                <Form.Item
                  name='ip'
                  label={$t({ defaultMessage: 'IP Address' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) =>
                      edgePortIpValidator(value, getCurrentSubnetInfo().subnetMask)
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
                  name='subnet'
                  label={$t({ defaultMessage: 'Subnet Mask' })}
                  rules={[
                    { required: true },
                    { validator: (_, value) => subnetMaskIpRegExp(value) }
                  ]}
                  children={<Input />}
                />
              </Col>
            </Row></>
            : ''
        }}
      </Form.Item>
    </Form>
  )

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'OK' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      title={$t(
        { defaultMessage: 'Select Cluster Interface: {nodeName}' },
        { nodeName: editData?.nodeName }
      )}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
      width={'400px'}
    />
  )
}
