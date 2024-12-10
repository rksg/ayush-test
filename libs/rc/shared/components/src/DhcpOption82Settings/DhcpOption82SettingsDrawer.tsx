import { useContext } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }               from '@acx-ui/components'
import { DhcpOption82Settings } from '@acx-ui/rc/utils'

import { SoftgreProfileAndDHCP82Context } from '../SoftGRETunnelSettings'

import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'
interface DhcpOption82SettingsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  callbackFn?: () => void
  index: number
  onGUIChanged?: (fieldName: string) => void
  isUnderAPNetworking: boolean,
  existedDHCP82OptionSettings?: DhcpOption82Settings
}


export const DhcpOption82SettingsDrawer = (props: DhcpOption82SettingsDrawerProps) => {

  const {
    visible,
    setVisible,
    callbackFn = () => {},
    index,
    onGUIChanged,
    isUnderAPNetworking,
    existedDHCP82OptionSettings
  } = props

  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const {
    onChangeDHCPOption82Settings
  } = useContext(SoftgreProfileAndDHCP82Context)

  const handleAdd = async () => {
    try {
      setVisible(false)
      onGUIChanged && onGUIChanged('AddDHCPOption82')
      if(!isUnderAPNetworking && onChangeDHCPOption82Settings) {
        const settings = form?.getFieldValue(['lan', index, 'dhcpOption82']) as DhcpOption82Settings
        onChangeDHCPOption82Settings(settings)
      }
      callbackFn()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'DHCP Option 82 Sub Options' })}
      visible={visible}
      width={850}
      children={
        <DhcpOption82SettingsFormField
          context={'lanport'}
          onGUIChanged={onGUIChanged}
          index={index}
          isUnderAPNetworking={isUnderAPNetworking}
          existedDHCP82OptionSettings={existedDHCP82OptionSettings}
        />
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Add' })
          }}
          onCancel={handleClose}
          onSave={handleAdd}
        />
      }
    />
  )

}
