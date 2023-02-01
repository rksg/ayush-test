import { useContext } from 'react'

import { Button, Space } from 'antd'
import { useIntl }       from 'react-intl'

import { AnchorLayout, showToast, StepsForm, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                  from '@acx-ui/icons'
import { VenueApModelCellular }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'
import { directedMulticastInfo }                       from '@acx-ui/utils'

import { VenueEditContext } from '../../index'

import { CellularOptionsForm } from './CellularOptions/CellularOptionsForm'
import { DirectedMulticast }   from './DirectedMulticast'
import { LanPorts }            from './LanPorts'
import { MeshNetwork }         from './MeshNetwork'


export interface NetworkingSettingContext {
  cellularData: VenueApModelCellular,
  meshData: { mesh: boolean },
  updateCellular: ((cellularData: VenueApModelCellular) => void),
  updateMesh: ((check: boolean) => void),
  updateDirectedMulticast: (() => void),
  updateLanPorts: (() => void),
  discardLanPorts?: (() => void)
}

export function NetworkingTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { venueId } = params
  const navigate = useNavigate()
  const basePath = useTenantLink('/venues/')

  const supportDirectedMulticast = useIsSplitOn(Features.DIRECTED_MULTICAST)

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
    title: $t({ defaultMessage: 'Cellular Options' }),
    content: <>
      <StepsForm.SectionTitle id='cellular-options'>
        { $t({ defaultMessage: 'Cellular Options' }) }
      </StepsForm.SectionTitle>
      <CellularOptionsForm />
    </>
  }, {
    title: $t({ defaultMessage: 'Mesh Network' }),
    content: <>
      <StepsForm.SectionTitle id='mesh-network'>
        { $t({ defaultMessage: 'Mesh Network' }) }
      </StepsForm.SectionTitle>
      <MeshNetwork />
    </>
  // }, {
  //   title: $t({ defaultMessage: 'Client Isolation Allowlist' }),
  //   content: 'Client Isolation Allowlist Content'
  }]

  if (supportDirectedMulticast) {
    items.push({
      title: $t({ defaultMessage: 'Directed Multicast' }),
      content: <>
        <StepsForm.SectionTitle id='directed-multicast'>
          {<Space align='baseline'>
            { $t({ defaultMessage: 'Directed Multicast' }) }
            <Tooltip
              title={$t( directedMulticastInfo )}
              placement='right'>
              <Button type='text'
                style={{ height: '18px', width: '18px' }}
                icon={
                  <QuestionMarkCircleOutlined style={{ height: 'inherit', width: 'inherit' }}/>}
              />
            </Tooltip>
          </Space>
          }
        </StepsForm.SectionTitle>
        <DirectedMulticast />
      </> })
  }

  const handleUpdateAllSettings = async () => {
    try {
      await editNetworkingContextData?.updateLanPorts?.()
      await editNetworkingContextData?.updateCellular?.(editNetworkingContextData.cellularData)
      await editNetworkingContextData?.updateMesh?.(editNetworkingContextData.meshData.mesh)
      await editNetworkingContextData?.updateDirectedMulticast?.()
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
