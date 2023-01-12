import { useContext } from 'react'

import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import { AnchorLayout, showToast, StepsForm, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                  from '@acx-ui/icons'
import { VenueApModelCellular }                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }       from '@acx-ui/react-router-dom'

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
  // eslint-disable-next-line max-len
  const directedMulticastInfo = 'When Directed Multicast is enabled, the AP inspects multicast traffic and monitors client IGMP/MLD subscriptions to determine packet handling. For multicast data subscribed to by the AP’s wireless clients, the AP will convert packets to unicast. When no client is subscribed, the AP will drop the packets. Some well-known traffic types (Bonjour, uPnP, etc) will bypass this logic altogether, and multicast-to-unicast conversion will be determined by the “Directed Threshold” in the WLAN advanced settings.'

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
          {<>
            { $t({ defaultMessage: 'Directed Multicast' }) }
            <Tooltip
              title={$t({ defaultMessage: directedMulticastInfo })}
              placement='right'>
              <Button type='text'
                icon={<QuestionMarkCircleOutlined/>}
                style={{ marginLeft: '10px' }}/>
            </Tooltip>
          </>
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
