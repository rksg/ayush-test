import { useContext, useEffect } from 'react'

import { FormInstance } from 'antd/es/form/Form'
import _                from 'lodash'
import { useIntl }      from 'react-intl'

import { Drawer, showActionModal }                  from '@acx-ui/components'
import { BonjourFencingService, BridgeServiceEnum } from '@acx-ui/rc/utils'

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


  const content = <BonjourFencingServiceForm form={form} />

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const validFormData = (d: BonjourFencingService) => {
    const { service, wiredEnabled, wiredRules=[], customMappingEnabled, customStrings=[] } = d

    if (service === BridgeServiceEnum.OTHER) {
      if (!customMappingEnabled) {
        showActionModal({
          type: 'error',
          //title: $t({ defaultMessage: 'Error' }),
          content:
          $t({
            defaultMessage: 'The Custom Mapping must be enabled when the service is \'Other\'.'
          })
        })
        return false
      }

      const existedOtherService = otherServices.filter(s => s.service === BridgeServiceEnum.OTHER)
      if (Array.isArray(existedOtherService) && wiredRules.length > 0) {
        const curMacList = _.flatMap(wiredRules, (wr) => {
          return wr.deviceMacAddresses
        })

        let inUseMacList: string[] = []
        existedOtherService.forEach(s => {
          const wrs = s.wiredRules

          if (Array.isArray(wrs) && wrs.length > 0) {
            const macList = _.flatMap(wrs, (wr) => {
              return wr.deviceMacAddresses
            })
            inUseMacList = _.concat(inUseMacList, macList)
          }
        })
        const conflictMacList = curMacList.filter(m => inUseMacList.includes(m))

        if (conflictMacList.length > 0) {

          showActionModal({
            type: 'error',
            //title: $t({ defaultMessage: 'Error' }),
            content:
            $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'The below Device MAC Addresses already in use for another \'Other\' service.{br}{macList}'
            },{
              br: <br/>,
              macList: conflictMacList.join(', ')
            })
          })
          return false
        }

      }
    }

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
