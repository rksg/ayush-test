import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

// import { Loader } from '@acx-ui/components'
import {
  useGetLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareVersion,
  FirmwareVenueVersion,
  FirmwareCategory
} from '@acx-ui/rc/utils'

// import * as UI from './styledComponents'


export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  let versions = getReleaseFirmware(latestReleaseVersions)
  let firmware = versions[0]
  return (
    <div>
      <div>
        {$t(
          { defaultMessage: 'Latest Version: {count}' },
          { count: firmware?.name }
        )}
      </div>
      <div>
        <span>{firmware?.category}</span>
        <span>{ (firmware?.category) }</span>
        <span>-</span>
        <span>{firmware?.createdDate}</span>
      </div>
    </div>

  // <div>
  //   <UI.TitleWrapper>
  //     <UI.TitleContainer>
  //       Latest Version
  //     </UI.TitleContainer>
  //   </UI.TitleWrapper>

  //   <div className='version-info-container'>
  //     <div className='firmware-divider'></div>
  //     <div className='firmware-version-wrapper'>
  //       <div className='version-number-wrapper'>Version firmware.name</div>
  //       <div className='firmware-type-wrapper'>
  //         <span className='type'>firmware.category | firmwareType: 'type'</span>
  //         <span className='firmware-info'>
  //           <span className='subType'> (firmware.category | firmwareType: 'subType') </span>
  //           <span className='firmware-info-divider'></span>
  //           <span className='firmware-date'>firmware.createdDate | date: 'MMM dd, yyyy'</span>
  //         </span>
  //       </div>
  //     </div>
  //   </div>
  // </div>
  )
}

export default VersionBanner

const categoryIsReleaseFunc = ((lv : FirmwareVersion | FirmwareVenueVersion) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

function getReleaseFirmware (firmwareVersions: FirmwareVersion[] = []): FirmwareVersion[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}
