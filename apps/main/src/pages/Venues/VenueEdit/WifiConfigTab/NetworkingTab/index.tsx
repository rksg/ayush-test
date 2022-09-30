import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm } from '@acx-ui/components'

import { VenueEditContext, AdvancedSettingContext } from '../../index'

import { MeshNetwork } from './MeshNetwork'


export function NetworkingTab () {
  const { $t } = useIntl()

  const { editContextData, setEditContextData } = useContext(VenueEditContext)

  const items = [{
  //   title: $t({ defaultMessage: 'LAN Ports' }),
  //   content: 'LAN Ports Content'
  // }, {
  //   title: $t({ defaultMessage: 'Cellular Options' }),
  //   content: (<CellularOptionsForm></CellularOptionsForm>)
  // }, {
    title: $t({ defaultMessage: 'Mesh Network' }),
    content: (<MeshNetwork />)
  // }, {
  //   title: $t({ defaultMessage: 'Client Isolation Allowlist' }),
  //   content: 'Client Isolation Allowlist Content'
  }]

  const handleUpdateAllSettings = async () => {
    try {
      console.log(editContextData?.updateChanges)
      for (let i=0; i < editContextData?.updateChanges.length; i++) {
        if(editContextData?.updateChanges[i]){
          editContextData?.updateChanges[i]?.()
        }
      }
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <StepsForm
      onFinish={handleUpdateAllSettings}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}
