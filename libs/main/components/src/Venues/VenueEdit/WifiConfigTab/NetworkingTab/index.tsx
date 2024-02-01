import { useContext, useEffect, useState } from 'react'

import { Button, Space } from 'antd'
import { isEmpty }       from 'lodash'
import { useIntl }       from 'react-intl'

import { AnchorLayout, StepsFormLegacy, Tooltip }                                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                                 from '@acx-ui/icons'
import { usePathBasedOnConfigTemplate }                                                               from '@acx-ui/rc/components'
import { useGetVenueApCapabilitiesQuery, useGetVenueTemplateApCapabilitiesQuery, useLazyApListQuery } from '@acx-ui/rc/services'
import { CapabilitiesApModel, VenueApModelCellular, redirectPreviousPage }                            from '@acx-ui/rc/utils'
import { useNavigate, useParams }                                                                     from '@acx-ui/react-router-dom'
import { directedMulticastInfo }                                                                      from '@acx-ui/utils'

import { useVenueConfigTemplateQueryFnSwitcher } from '../../../venueConfigTemplateApiSwitcher'
import { VenueEditContext }                      from '../../index'

import { CellularOptionsForm } from './CellularOptions/CellularOptionsForm'
import { DirectedMulticast }   from './DirectedMulticast'
import { LanPorts }            from './LanPorts'
import { MeshNetwork }         from './MeshNetwork'
import { RadiusOptions }       from './RadiusOptions'


export interface NetworkingSettingContext {
  cellularData: VenueApModelCellular,
  updateCellular?: ((cellularData: VenueApModelCellular) => void),
  updateMesh?: (() => void),
  updateDirectedMulticast?: (() => void),
  updateLanPorts?: (() => void),
  discardLanPorts?: (() => void),
  updateRadiusOptions?: (() => void)
}

export function NetworkingTab () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate('/venues/')
  const { tenantId, venueId } = useParams()

  const supportDirectedMulticast = useIsSplitOn(Features.DIRECTED_MULTICAST)
  const supportRadiusOptions = useIsSplitOn(Features.RADIUS_OPTIONS)

  const [cellularApModels, setCellularApModels] = useState<string[]>([])
  const [hasCellularAps, setHasCellularAps] = useState(false)

  // eslint-disable-next-line max-len
  const { data: venueCaps } = useVenueConfigTemplateQueryFnSwitcher<{ version: string, apModels:CapabilitiesApModel[] }>(
    useGetVenueApCapabilitiesQuery,
    useGetVenueTemplateApCapabilitiesQuery
  )

  const [ getApList ] = useLazyApListQuery()

  useEffect(() => {
    if (venueCaps) {
      let apModels = venueCaps.apModels
        .filter(apCapability => apCapability.canSupportCellular === true)
        .map(apCapability => apCapability.model) as string[]

      setCellularApModels(apModels)
    }
  }, [venueCaps])

  useEffect(() => {
    const cellurlarApModelNames = isEmpty(cellularApModels)? ['M510'] : cellularApModels
    let filters = { model: cellurlarApModelNames, venueId: [venueId] }

    const payload = {
      fields: ['name', 'model', 'venueId', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters
    }

    if (getApList) {
      getApList({ params: { tenantId }, payload }, true).unwrap().then((res)=>{
        const { data } = res || {}
        setHasCellularAps(!!(data?.length > 0))
      })
    }
  }, [cellularApModels])

  const {
    previousPath,
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

  const items = [{
    title: $t({ defaultMessage: 'LAN Ports' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='lan-ports'>
        { $t({ defaultMessage: 'LAN Ports' }) }
      </StepsFormLegacy.SectionTitle>
      <LanPorts />
    </>
  }, {
    title: $t({ defaultMessage: 'Mesh Network' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='mesh-network'>
        { $t({ defaultMessage: 'Mesh Network' }) }
      </StepsFormLegacy.SectionTitle>
      <MeshNetwork />
    </>
  },
  ...(supportDirectedMulticast? [{
    title: $t({ defaultMessage: 'Directed Multicast' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='directed-multicast'>
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
      </StepsFormLegacy.SectionTitle>
      <DirectedMulticast />
    </> }] : []),
  ...(hasCellularAps? [{
    title: $t({ defaultMessage: 'Cellular Options' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='cellular-options'>
        { $t({ defaultMessage: 'Cellular Options' }) }
      </StepsFormLegacy.SectionTitle>
      <CellularOptionsForm />
    </> }] : []),
  ...(supportRadiusOptions? [{
    title: $t({ defaultMessage: 'RADIUS Options' }),
    content: <>
      <StepsFormLegacy.SectionTitle id='radius-options'>
        { $t({ defaultMessage: 'RADIUS Options' }) }
      </StepsFormLegacy.SectionTitle>
      <RadiusOptions />
    </> }] : []
  )]

  const handleUpdateAllSettings = async () => {
    try {
      await editNetworkingContextData?.updateLanPorts?.()
      await editNetworkingContextData?.updateCellular?.(editNetworkingContextData.cellularData)
      await editNetworkingContextData?.updateMesh?.()
      await editNetworkingContextData?.updateDirectedMulticast?.()
      await editNetworkingContextData?.updateRadiusOptions?.()

      setEditContextData?.({
        ...editContextData,
        unsavedTabKey: 'networking',
        isDirty: false
      })

      // clear update functions avoid to be trigger again
      if (editNetworkingContextData) {
        const newData = { ...editNetworkingContextData }
        delete newData.updateLanPorts
        delete newData.updateCellular
        delete newData.updateMesh
        delete newData.updateDirectedMulticast
        delete newData.updateRadiusOptions

        setEditNetworkingContextData(newData)
      }

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsFormLegacy
      onFinish={handleUpdateAllSettings}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsFormLegacy.StepForm>
        <AnchorLayout items={items} offsetTop={60} waitForReady />
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  )
}
