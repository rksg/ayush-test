
import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Drawer, Select }           from '@acx-ui/components'
import { EdgeClusterTableDataType } from '@acx-ui/rc/utils'

import * as UI                 from './styledComponents'
import { useGetLanInterfaces } from './useGetLanInterfaces'

interface SelectInterfaceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  handleFinish: (data: unknown, index?: number) => void
  currentVipIndex?: number
  currentCluster?: EdgeClusterTableDataType
  selectedInterface?: {
      serialNumber: string,
      portName: string
  }[]
}

export const SelectInterfaceDrawer = (props: SelectInterfaceDrawerProps) => {
  const { visible, setVisible, currentVipIndex, currentCluster, handleFinish: handleOk } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const { lanInterfaces, isLoading } = useGetLanInterfaces(currentCluster?.edgeList)

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    form.submit()
  }

  const handleFinish = async (data: unknown) => {
    handleOk(data, currentVipIndex)
    handleClose()
  }

  const drawerContent = (
    <Form
      form={form}
      onFinish={handleFinish}
      layout='vertical'
    >
      <Row gutter={[16, 10]}>
        {
          currentCluster?.edgeList?.map(item => (
            <Col span={24}>
              <UI.EdgeNameHeadLine>{item.name}</UI.EdgeNameHeadLine>
              {/* <Form.Item
                shouldUpdate={(prev, cur) => {
                  console.log(prev, cur)
                  console.log(item.serialNumber)
                  console.log(prev[item.serialNumber]?.port, cur[item.serialNumber]?.port)
                  return prev[item.serialNumber]?.port !== cur[item.serialNumber]?.port
                }}
                noStyle
              >
                {
                  () => */}
              <Form.Item
                name={[item.serialNumber, 'port']}
                label={$t({ defaultMessage: 'Select Port' })}
                dependencies={[item.serialNumber, 'port']}
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please select a port' })
                  }
                ]}
                extra={$t(
                  { defaultMessage: 'IP subnet: {ip}' },
                  {
                    ip: lanInterfaces[item.serialNumber]?.find(item =>
                      item.portName === form.getFieldValue([item.serialNumber, 'port']))?.ip ?? ''
                  }
                )}
                children={
                  <Select
                    loading={isLoading}
                    options={
                      lanInterfaces[item.serialNumber]?.map(test => ({
                        label: test.portName,
                        value: test.portName
                      })).sort()
                    }
                  />
                }
              />
              {/* }
              </Form.Item> */}
            </Col>
          ))
        }
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
        { defaultMessage: 'Select Interfaces: #{vipIndex} Virtual IP' },
        { vipIndex: currentVipIndex }
      )}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
      destroyOnClose
    />
  )
}