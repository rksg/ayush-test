import { useIntl } from 'react-intl'

import { Drawer }                                 from '@acx-ui/components'
import { SoftGreProfileDispatcher, SoftGreState } from '@acx-ui/rc/utils'

import { DhcpOption82SettingsFormField } from './DhcpOption82SettingsFormField'
interface DhcpOption82SettingsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  applyCallbackFn: () => void
  cancelCallbackFn: () => void
  index: number
  onGUIChanged?: (fieldName: string) => void
  readonly: boolean
  portId?: string
  dispatch?: React.Dispatch<SoftGreProfileDispatcher>;
}


export const DhcpOption82SettingsDrawer = (props: DhcpOption82SettingsDrawerProps) => {

  const {
    visible,
    setVisible,
    applyCallbackFn,
    cancelCallbackFn,
    index,
    onGUIChanged,
    readonly,
    portId,
    dispatch
  } = props

  const { $t } = useIntl()

  const handleAdd = async () => {
    try {
      setVisible(false)
      onGUIChanged && onGUIChanged('AddDHCPOption82')
      applyCallbackFn()
      // eslint-disable-next-line
      dispatch && dispatch({
        state: SoftGreState.TurnOnAndModifyDHCPOption82Settings,
        portId,
        index
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleClose = () => {
    cancelCallbackFn()
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'DHCP Option 82 Sub Options' })}
      visible={visible}
      width={850}
      children={
        <DhcpOption82SettingsFormField
          readonly={readonly}
          labelWidth={'280px'}
          context={'lanport'}
          onGUIChanged={onGUIChanged}
          index={index}
        />
      }
      onClose={handleClose}
      destroyOnClose={true}
      footer={
        <Drawer.FormFooter
          showSaveButton={!readonly}
          buttonLabel={{
            save: $t({ defaultMessage: 'Apply' })
          }}
          onCancel={handleClose}
          onSave={handleAdd}
        />
      }
    />
  )

}
