import { useContext, useEffect } from 'react'

import { FormInstance } from 'antd/es/form/Form'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import { Drawer, showActionModal }               from '@acx-ui/components'
import { MdnsFencingService, BridgeServiceEnum } from '@acx-ui/rc/utils'

import MdnsFencingServiceForm        from './MdnsFencingServiceForm/MdnsFencingServiceForm'
import { MdnsFencingServiceContext } from './MdnsFencingServiceTable'


export interface MdnsFencingDrawerProps {
  form: FormInstance,
  visible: boolean,
  setVisible: (v: boolean) => void,
  onDataChanged: (d: MdnsFencingService) => void
}

export default function MdnsFencingDrawer (props: MdnsFencingDrawerProps) {
  const { $t } = useIntl()
  const { currentService={}, currentServiceRef } = useContext(MdnsFencingServiceContext)
  const { visible, setVisible, onDataChanged, form } = props

  const isEditMode = !_.isEmpty(currentService)

  useEffect(() => {
    form.setFieldsValue(currentService)
  }, [currentService])


  const content = <MdnsFencingServiceForm form={form} />

  const onClose = () => {
    setVisible(false)
  }

  const validFormData = (d: MdnsFencingService) => {
    const { service, wiredEnabled, wiredRules=[], customMappingEnabled, customStrings=[] } = d

    if (service === BridgeServiceEnum.OTHER) {
      if (!customMappingEnabled) {
        showActionModal({
          type: 'error',
          content:
          $t({
            defaultMessage: 'The Custom Mapping must be enabled when the service is \'Other\'.'
          })
        })
        return false
      }
    }

    if (wiredEnabled && wiredRules.length === 0) {
      showActionModal({
        type: 'error',
        content:
          $t({
            defaultMessage: 'The Wired Connection settings must contain at least one fencing rule.'
          })
      })
      return false
    }

    if (customMappingEnabled && customStrings.length === 0) {
      showActionModal({
        type: 'error',
        content:
          $t({
            defaultMessage: 'The Custom String List can\'t empty.'
          })
      })
      return false
    }
    return true

  }

  const onSave = async (d: MdnsFencingService) => {

    try {
      const valid = await form.validateFields()
      const data = currentServiceRef.current
      if (valid && validFormData(d) && data) {
        onDataChanged(data)
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  // reset form fields when drawer is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.resetFields()
    }
  }

  return (
    <Drawer
      title={isEditMode
        ? $t({ defaultMessage: 'Edit Service' })
        : $t({ defaultMessage: 'Add Service' })}
      width={'550px'}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      afterVisibleChange={handleOpenChange}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: isEditMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={async () => {
            await onSave(form.getFieldsValue())
          }}
        />
      }
    />
  )
}
