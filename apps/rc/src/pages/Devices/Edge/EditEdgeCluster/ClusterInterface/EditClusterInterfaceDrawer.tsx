import { useEffect } from 'react'

import { Col, Form, Input, Row } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Drawer, Select, StepsForm, Tooltip } from '@acx-ui/components'
import {
  EdgePortInfo,
  EdgePortTypeEnum,
  edgePortIpValidator,
  lanPortsubnetValidator,
  optionSorter,
  subnetMaskIpRegExp
} from '@acx-ui/rc/utils'

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
    form.setFieldsValue(editData)
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

  const handleInterfaceChange = (value: string) => {
    const currentInterface = interfaceList?.find(item => item.portName === value)
    form.setFieldsValue({
      ip: currentInterface?.ip,
      subnet: currentInterface?.subnet
    })
  }

  const getCurrentSubnetInfo = () => {
    return {
      ip: form.getFieldValue('ip'),
      subnetMask: form.getFieldValue('subnet')
    }
  }

  const getSubnetInfoWithoutCurrent = () => {
    return allNodeData?.filter(item => item.serialNumber !== editData?.serialNumber)
      .map(item => ({ ip: item.ip ?? '', subnetMask: item.subnet ?? '' })) ?? []
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
      <Row>
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
                validator: () =>
                  lanPortsubnetValidator(getCurrentSubnetInfo(), getSubnetInfoWithoutCurrent()),
                message: $t({ defaultMessage: 'The subnet range overlaps with other nodes.' })
              }
            ]}
            children={<Input />}
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
      </Row>
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