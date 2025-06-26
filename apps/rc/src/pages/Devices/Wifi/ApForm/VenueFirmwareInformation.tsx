import { Space } from 'antd'

import { useGetVenueApModelFirmwaresQuery } from '@acx-ui/rc/services'
import { VenueExtended }                    from '@acx-ui/rc/utils'

import { VersionChangeAlert } from './VersionChangeAlert'


interface VenueInformationProps {
  isEditMode: boolean
  venue: VenueExtended
  apModel: string
  currentApFirmware: string
}

export function VenueFirmwareInformation (props: VenueInformationProps) {
  const { isEditMode, venue, apModel, currentApFirmware } = props

  // eslint-disable-next-line max-len
  const { apFirmwareInVenue } = useGetVenueApModelFirmwaresQuery({ params: { venueId: venue.id } }, {
    skip: !venue.id,
    selectFromResult: ({ data }) => ({
      apFirmwareInVenue: data?.find(item => item.apModel === apModel)?.firmware
    })
  })

  const targetDisplayFirmware = apFirmwareInVenue

  return <Space direction='vertical' style={{ margin: '8px 0' }}>
    { isEditMode && currentApFirmware && targetDisplayFirmware &&
      // eslint-disable-next-line max-len
      <VersionChangeAlert targetVersion={targetDisplayFirmware} existingVersion={currentApFirmware}/>
    }
  </Space>
}
