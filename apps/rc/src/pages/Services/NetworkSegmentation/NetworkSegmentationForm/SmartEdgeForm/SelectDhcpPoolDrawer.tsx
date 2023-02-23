import { Divider, Form, Radio } from 'antd'
import { useIntl }              from 'react-intl'

import { Drawer, StepsForm, Subtitle } from '@acx-ui/components'
import { EdgeDhcpPool }                from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface SelectDhcpPoolDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  selectPool: (poolId?: string, poolName?: string) => void
  data?: EdgeDhcpPool[]
}

export const SelectDhcpPoolDrawer = (props: SelectDhcpPoolDrawerProps) => {

  const { $t } = useIntl()
  const { visible, setVisible, selectPool, data } = props
  const [formRef] = Form.useForm()

  const handleClose = () => {
    setVisible(false)
  }

  const handleSave = async () => {
    formRef.submit()
  }

  const handleFinish = (formData: { poolId: string }) => {
    const poolItem = data?.find(item => item.id === formData.poolId)
    selectPool(poolItem?.id, poolItem?.poolName)
    setVisible(false)
  }

  const drawerContent = <Form layout='vertical' form={formRef} onFinish={handleFinish}>
    <Form.Item
      name='poolId'
      rules={[
        {
          required: true,
          message: $t({ defaultMessage: 'Please select a DHCP pool' })
        }
      ]}
    >
      <Radio.Group
        options={
          data?.map(item => ({
            label: <>
              <Subtitle level={4}>{item.poolName}</Subtitle>
              <StepsForm.FieldLabel width='100px'>
                {$t({ defaultMessage: 'Subnet Mask:' })}
                <UI.RadioDescription
                  children={item.subnetMask}
                />
              </StepsForm.FieldLabel>
              <StepsForm.FieldLabel width='100px'>
                {$t({ defaultMessage: 'Pool Range:' })}
                <UI.RadioDescription
                  children={`${item.poolStartIp} - ${item.poolEndIp}`}
                />
              </StepsForm.FieldLabel>
              <Divider />
            </>,
            value: item.id
          })) || []
        }
      />
    </Form.Item>
  </Form>

  const footer = (
    <Drawer.FormFooter
      buttonLabel={{
        save: $t({ defaultMessage: 'Select' })
      }}
      onCancel={handleClose}
      onSave={handleSave}
    />
  )

  return (
    <Drawer
      width={400}
      title={$t({ defaultMessage: 'Select DHCP Pool' })}
      visible={visible}
      onClose={handleClose}
      children={drawerContent}
      footer={footer}
    />
  )
}