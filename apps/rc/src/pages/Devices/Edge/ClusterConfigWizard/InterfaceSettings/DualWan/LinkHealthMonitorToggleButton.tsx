import { useState } from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Button, Drawer }               from '@acx-ui/components'
import { EdgeWanLinkHealthCheckPolicy } from '@acx-ui/rc/utils'

import { LinkHealthMonitorSettingForm } from './LinkHealthMonitorSettingForm'
import { EditOutlinedIcon }             from './styledComponents'

export const LinkHealthMonitorToggleButton = (props: {
  portName: string
  enabled: boolean
  data: EdgeWanLinkHealthCheckPolicy | undefined,
  onChange: (enabled: boolean, data: EdgeWanLinkHealthCheckPolicy | undefined) => void
}) => {
  const { $t } = useIntl()
  const { data, portName, enabled, onChange } = props
  const [visible, setVisible] = useState<boolean>(false)

  const [ form ] = Form.useForm()

  const onClose = () => {
    setVisible(false)
  }
  const handleEdit = () => {
    setVisible(true)
  }

  const handleFinish = async (formValues: EdgeWanLinkHealthCheckPolicy) => {
    try {
    // set into context
      onChange(enabled, formValues)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      onClose()
    }
  }

  return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    <Switch
      checked={enabled}
      onChange={(checked) => {
        setVisible(checked)
        onChange(checked, data)
      }}
    />
    { enabled && <Button type='link' icon={<EditOutlinedIcon />} onClick={handleEdit}/> }

    <Drawer
      visible={visible}
      title={$t({ defaultMessage: '{portName}: Link Health Monitoring' }, { portName })}
      destroyOnClose
      onClose={onClose}
      footer={
        <Drawer.FormFooter
          onCancel={onClose}
          onSave={async () => {
            form.submit()
          }}
        />
      }
    >
      <LinkHealthMonitorSettingForm
        form={form}
        onFinish={handleFinish}
        editData={data}
      />
    </Drawer>
  </Space>
}