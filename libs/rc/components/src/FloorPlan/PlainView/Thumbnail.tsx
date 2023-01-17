import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

import NetworkDevices from '../NetworkDevices'

import * as UI from './styledComponents'

export default function Thumbnail (props: {
    floorPlan: FloorPlanDto,
    active: number,
    onFloorPlanSelection: CallableFunction,
    networkDevicesVisibility: NetworkDeviceType[],
    networkDevices: {
      [key: string]: TypeWiseNetworkDevices;
  } }) {
  const { floorPlan,
    active,
    onFloorPlanSelection,
    networkDevicesVisibility,
    networkDevices } = props
  const { $t } = useIntl()
  function selectFloorPlan () {
    onFloorPlanSelection(floorPlan)
  }

  const altMessage: MessageDescriptor = defineMessage({
    defaultMessage: 'Thumbnail for {floorPlanName}'
  })

  return <UI.Thumbnail>
    <UI.StyledCardGrid
      onClick={selectFloorPlan}
      hoverable={false}
      active={active}
      data-testid='thumbnailBg'>
      <div style={{ width: '100%', height: '53px', position: 'relative' }}>
        <NetworkDevices
          networkDevicesVisibility={networkDevicesVisibility}
          selectedFloorPlan={floorPlan}
          networkDevices={networkDevices}
          contextAlbum={true}
          galleryMode={false}/>
        <img
          style={{ width: '100%', height: '100%' }}
          src={floorPlan.imageUrl}
          alt={$t(altMessage,
            { floorPlanName: floorPlan?.name })}/>
      </div>
    </UI.StyledCardGrid>
    <UI.ImageDesc key={floorPlan.name} active={active}>
      {floorPlan.name}
    </UI.ImageDesc>
  </UI.Thumbnail>
}