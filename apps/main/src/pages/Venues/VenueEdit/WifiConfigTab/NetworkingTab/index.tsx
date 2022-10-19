import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm }    from '@acx-ui/components'
import { VenueApModelCellular }               from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../../index'

import { CellularOptionsForm } from './CellularOptions/CellularOptionsForm'
import { MeshNetwork }         from './MeshNetwork'


export interface NetworkingSettingContext {
  cellularData: VenueApModelCellular,
  meshData: { mesh: boolean },
  updateCellular: ((cellularData: VenueApModelCellular) => void),
  updateMesh: ((check: boolean) => void)
}

export function NetworkingTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData
  } = useContext(VenueEditContext)

  const items = [{
  //   title: $t({ defaultMessage: 'LAN Ports' }),
  //   content: 'LAN Ports Content'
  // }, {
    title: $t({ defaultMessage: 'Cellular Options' }),
    content: (<CellularOptionsForm />)
  }, {
    title: $t({ defaultMessage: 'Mesh Network' }),
    content: (<MeshNetwork />)
  // }, {
  //   title: $t({ defaultMessage: 'Client Isolation Allowlist' }),
  //   content: 'Client Isolation Allowlist Content'
  }]

  const handleUpdateAllSettings = async () => {
    try {
      editNetworkingContextData?.updateCellular?.(editNetworkingContextData.cellularData)
      await editNetworkingContextData?.updateMesh?.(editNetworkingContextData.meshData.mesh)
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
      onCancel={() => navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${venueId}/venue-details/overview`
      })}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <AnchorLayout items={items} offsetTop={275} />
      </StepsForm.StepForm>
    </StepsForm>
  )
}
