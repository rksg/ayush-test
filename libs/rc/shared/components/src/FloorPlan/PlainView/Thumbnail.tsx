import { useEffect, useState } from 'react'

import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { FloorPlanDto, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { loadImageWithJWT }                                        from '@acx-ui/utils'

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
  const [imageUrl, setImageUrl] = useState('')
  const { $t } = useIntl()
  function selectFloorPlan () {
    onFloorPlanSelection(floorPlan)
  }

  useEffect(() => {
    if (floorPlan?.imageId) {
      const response = loadImageWithJWT(floorPlan?.imageId)
      response.then((_imageUrl) => {
        setImageUrl(_imageUrl)
      })
    }
  }, [floorPlan?.imageId])

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
          data-testid='thumbnailBgImage'
          style={{ width: '100%', height: '100%' }}
          src={imageUrl}
          alt={$t(altMessage,
            { floorPlanName: floorPlan?.name })}/>
      </div>
    </UI.StyledCardGrid>
    <UI.ImageDesc key={floorPlan.name} active={active}>
      {floorPlan.name}
    </UI.ImageDesc>
  </UI.Thumbnail>
}