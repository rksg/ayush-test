import { Checkbox, Form, Switch } from 'antd'
import { useIntl }                from 'react-intl'
import styled                     from 'styled-components'

import { Drawer, Subtitle } from '@acx-ui/components'
import { SpaceWrapper }     from '@acx-ui/rc/components'

interface PreferenceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 40px;
`

export const PreferenceDrawer = (props: PreferenceDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible } = props
  const [form] = Form.useForm()

  // const [updateNetworkFirmware] = useUpdateNetworkFirmwareMutation()
  // const [updateAllCustomersNotifications] = useUpdateAllCustomersNotificationsMutation()

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async () => {
    // const networkFirware = form.getFieldValue('networkFirmware')
    // const allNotifications = form.getFieldValue('allNotifications')
    try {
      await form.validateFields()
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const formContent = <Form layout='vertical'form={form} >
    <Label>
      {$t({ defaultMessage: 'Select the notifications you wish to receive:' })}
    </Label>

    <Subtitle level={5}>
      {$t({ defaultMessage: 'Aggregations' })}
    </Subtitle>

    <Form.Item
      name='networkFirmware'
    >
      <SpaceWrapper full justifycontent='flex-start'>
        <Checkbox
          // onChange={handleAccessSupportChange}
          // checked={isSupportAccessEnabled}
          // value={isSupportAccessEnabled}
        >
          {$t({ defaultMessage: 'Network device firmware updates weekly (AP & Switch)' })}
        </Checkbox>
      </SpaceWrapper>
    </Form.Item>
    <Form.Item
      name='allNotifications'
      noStyle
      valuePropName='checked'>
      <Switch
        style={{ marginLeft: '20px', marginTop: '-5px' }}
        // checked={enableBssColoring}
        // onClick={(checked) => {
        //   handleChanged(checked)
        // }}
      />
      <div><label>
        {$t({ defaultMessage: 'All customers do not receive this type of' })}
      </label></div>
      <div><label style={{ marginLeft: '57px' }}>
        {$t({ defaultMessage: 'notifications from RUCKUS One' })}
      </label></div>
    </Form.Item>
  </Form>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Notification Preference' })}
      width={401}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Apply' })
          }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
