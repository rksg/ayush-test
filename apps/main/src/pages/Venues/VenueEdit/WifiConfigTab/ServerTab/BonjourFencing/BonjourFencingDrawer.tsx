import { useContext, useEffect } from 'react'

import { FormInstance } from 'antd/es/form/Form'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import { Drawer, showActionModal } from '@acx-ui/components'
import { BonjourFencingService }   from '@acx-ui/rc/utils'

import BonjourFencingServiceForm        from './BonjourFencingServiceForm/BonjourFencingServiceForm'
import { BonjourFencingServiceContext } from './BonjourFencingServiceTable'


export interface BonjourFencingDrawerProps {
  form: FormInstance,
  visible: boolean,
  setVisible: (v: boolean) => void,
  onDataChanged: (d: BonjourFencingService) => void
}

export default function BonjourFencingDrawer (props: BonjourFencingDrawerProps) {
  const { $t } = useIntl()
  const { currentService={},
    otherServices,
    currentServiceRef } = useContext(BonjourFencingServiceContext)
  const { visible, setVisible, onDataChanged, form } = props

  const isEditMode = !_.isEmpty(currentService)

  useEffect(() => {
    form.setFieldsValue(currentService)
  }, [currentService])


  const content = <BonjourFencingServiceForm
    form={form}
    otherServices={otherServices}
  />

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const validFormData = (d: BonjourFencingService) => {
    const { wiredEnabled, wiredRules=[], customMappingEnabled, customStrings=[] } = d
    if (wiredEnabled && wiredRules.length === 0) {
      showActionModal({
        type: 'error',
        //title: $t({ defaultMessage: 'Error' }),
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
        //title: $t({ defaultMessage: 'Error' }),
        content:
          $t({
            defaultMessage: 'The Custom String List can\'t empty.'
          })
      })
      return false
    }
    return true

  }

  const onSave = async (d: BonjourFencingService) => {

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
