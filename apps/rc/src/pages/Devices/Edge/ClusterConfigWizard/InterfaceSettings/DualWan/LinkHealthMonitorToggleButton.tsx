import { useState } from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Button, Drawer }                                                                   from '@acx-ui/components'
import { defaultDualWanLinkHealthCheckPolicy }                                              from '@acx-ui/edge/components'
import { EdgeLinkDownCriteriaEnum, EdgeMultiWanProtocolEnum, EdgeWanLinkHealthCheckPolicy } from '@acx-ui/rc/utils'

import { LinkHealthMonitorSettingForm } from './LinkHealthMonitorSettingForm'
import { EditOutlinedIcon }             from './styledComponents'

export const LinkHealthMonitorToggleButton = (props: {
  portName: string
  enabled: boolean
  linkHealthSettings: EdgeWanLinkHealthCheckPolicy | undefined,
  onChange: (enabled: boolean, data: EdgeWanLinkHealthCheckPolicy | undefined) => void
}) => {
  const { $t } = useIntl()
  const { linkHealthSettings, portName, enabled, onChange } = props
  const [visible, setVisible] = useState<boolean>(false)

  const [ form ] = Form.useForm()

  const handleClose = () => {
    // reset into original values
    onChange(enabled, linkHealthSettings)
    setVisible(false)
  }
  const handleEdit = () => {
    setVisible(true)
  }

  const getInitialValues = () => {
    const {
      protocol: defaultProtocol,
      targetIpAddresses: defaultTargetIpAddresses,
      linkDownCriteria: defaultLinkDownCriteria,
      intervalSeconds: defaultIntervalSeconds,
      maxCountToDown: defaultMaxCountToDown,
      maxCountToUp: defaultMaxCountToUp
    } = defaultDualWanLinkHealthCheckPolicy

    const initialValues = {
      // eslint-disable-next-line max-len
      protocol: (!linkHealthSettings?.protocol || linkHealthSettings?.protocol === EdgeMultiWanProtocolEnum.NONE)
        ? defaultProtocol
        : linkHealthSettings?.protocol,
      targetIpAddresses: linkHealthSettings?.targetIpAddresses?.length
        ? linkHealthSettings?.targetIpAddresses
        : defaultTargetIpAddresses,
      // eslint-disable-next-line max-len
      linkDownCriteria: (!linkHealthSettings?.linkDownCriteria || linkHealthSettings?.linkDownCriteria === EdgeLinkDownCriteriaEnum.INVALID)
        ? defaultLinkDownCriteria
        : linkHealthSettings?.linkDownCriteria,
      intervalSeconds: linkHealthSettings?.intervalSeconds ?? defaultIntervalSeconds,
      maxCountToDown: linkHealthSettings?.maxCountToDown ?? defaultMaxCountToDown,
      maxCountToUp: linkHealthSettings?.maxCountToUp ?? defaultMaxCountToUp
    }

    return initialValues
  }

  const handleToggleChanged = (checked: boolean) => {
    let updatedData = linkHealthSettings

    // should set default values to parent form since user might just turn on link health check and not set any values
    // eslint-disable-next-line max-len
    if (checked && (!linkHealthSettings || linkHealthSettings?.protocol === EdgeMultiWanProtocolEnum.NONE)) {
      updatedData = getInitialValues()
    }

    onChange(checked, updatedData)
    setVisible(checked)
  }

  const handleLinkHealthFormFinish = async (formValues: EdgeWanLinkHealthCheckPolicy) => {
    try {
      // set into context
      onChange(enabled, formValues)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      handleClose()
    }
  }

  return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    <Switch
      checked={enabled}
      onChange={handleToggleChanged}
    />
    { enabled && <Button type='link' icon={<EditOutlinedIcon />} onClick={handleEdit}/> }

    <Drawer
      visible={visible}
      title={$t({ defaultMessage: '{portName}: Link Health Monitoring' }, { portName })}
      destroyOnClose
      onClose={handleClose}
      footer={
        <Drawer.FormFooter
          onCancel={handleClose}
          onSave={async () => {
            form.submit()
          }}
        />
      }
    >
      <LinkHealthMonitorSettingForm
        form={form}
        onFinish={handleLinkHealthFormFinish}
        editData={linkHealthSettings}
      />
    </Drawer>
  </Space>
}