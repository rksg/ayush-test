import { Image }                                     from 'antd'
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
      <NetworkDevices
        imageLoaded={true}
        networkDevicesVisibility={networkDevicesVisibility}
        selectedFloorPlan={floorPlan}
        networkDevices={networkDevices}
        contextAlbum={true}
        galleryMode={false}
        context=''/>
      <Image
        style={{ width: '78px', height: '53px' }}
        preview={false}
        src={floorPlan.imageUrl}
        alt={$t(altMessage,
          { floorPlanName: floorPlan?.name })}/>
    </UI.StyledCardGrid>
    <UI.ImageDesc key={floorPlan.name} active={active}>
      {floorPlan.name}
    </UI.ImageDesc>
  </UI.Thumbnail>
}