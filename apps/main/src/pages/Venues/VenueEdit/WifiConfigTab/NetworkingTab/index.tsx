import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm } from '@acx-ui/components'

import { VenueEditContext } from '../../index'

import { LanPorts }    from './LanPorts'
import { MeshNetwork } from './MeshNetwork'

export interface NetworkingSettingContext {
  cellularData: unknown,
  meshData: { mesh: boolean },
  updateCellular: (() => void),
  updateMesh: ((check: boolean) => void),
  updateLanPorts: (() => void),
  discardLanPorts?: (() => void)
}

export function NetworkingTab () {
  const { $t } = useIntl()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData
  } = useContext(VenueEditContext)

  const items = [{
    title: $t({ defaultMessage: 'LAN Ports' }),
    content: <>
      <StepsForm.SectionTitle id='lan-ports'>
        { $t({ defaultMessage: 'LAN Ports' }) }
      </StepsForm.SectionTitle>
      <LanPorts />
    </>
  }, {
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
      editNetworkingContextData?.updateCellular?.()
      await editNetworkingContextData?.updateLanPorts?.()
      editNetworkingContextData?.updateMesh?.(editNetworkingContextData.meshData.mesh)
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'networking',
        isDirty: false
      })
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
