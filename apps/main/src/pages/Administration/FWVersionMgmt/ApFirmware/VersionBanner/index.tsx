import { useIntl } from 'react-intl'

import {
  useGetAvailableABFListQuery
} from '@acx-ui/rc/services'
import { ABFVersion, FirmwareCategory } from '@acx-ui/rc/utils'

import { FirmwareBanner }   from '../../FirmwareBanner'
import { useApEolFirmware } from '../VenueFirmwareList/useApEolFirmware'


export const VersionBanner = () => {
  const { $t } = useIntl()
  const { latestActiveVersions } = useGetAvailableABFListQuery({}, {
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => {
      return {
        latestActiveVersions: data
          ? data.filter(abfVersion => abfVersion.abf === 'active')
          : []
      }
    }
  })
  const firmware = getRecommendedFirmware(latestActiveVersions)[0]
  const { latestEolVersionByABFs } = useApEolFirmware()

  if (!firmware) return null

  const versionInfo = [
    {
      label: $t({ defaultMessage: 'For Active Device:' }),
      firmware: {
        version: firmware.name,
        category: firmware.category,
        releaseDate: firmware.releaseDate ?? firmware.createdDate
      }
    },
    ...(latestEolVersionByABFs.map(item => ({
      label: $t({ defaultMessage: 'For Legacy Device:' }),
      firmware: {
        version: item.name,
        category: item.category,
        releaseDate: item.releaseDate
      }
    })))
  ]

  return (
    <FirmwareBanner data={versionInfo} />
  )
}

export default VersionBanner

function getRecommendedFirmware (firmwareVersions: ABFVersion[] = []):
(ABFVersion & { createdDate: string })[] {
  return firmwareVersions.filter((abf: ABFVersion) => {
    // eslint-disable-next-line max-len
    return abf.category === FirmwareCategory.RECOMMENDED || abf.category === FirmwareCategory.CRITICAL
  }) as (ABFVersion & { createdDate: string })[] // createdDate for legacy usage
}
