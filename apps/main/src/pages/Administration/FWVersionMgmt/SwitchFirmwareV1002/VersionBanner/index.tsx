import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { useSwitchFirmwareUtils }            from '@acx-ui/rc/components'
import {
  useGetSwitchDefaultFirmwareListV1002Query,
  useGetSwitchLatestFirmwareListV1002Query
} from '@acx-ui/rc/services'
import { FirmwareCategory, SwitchFirmwareModelGroup } from '@acx-ui/rc/utils'

import { SwitchFirmwareBanner } from '../../SwitchFirmwareBanner'


export const VersionBanner = () => {
  const params = useParams()

  const { $t } = useIntl()
  const modelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
    [SwitchFirmwareModelGroup.ICX71]: $t({ defaultMessage: 'For ICX Models (7150)' }),
    [SwitchFirmwareModelGroup.ICX7X]: $t({ defaultMessage: 'For ICX Models (7550-7850)' }),
    [SwitchFirmwareModelGroup.ICX82]: $t({ defaultMessage: 'For ICX Models (8200)' })
  }

  const { data: latestVersions } = useGetSwitchLatestFirmwareListV1002Query({ params })
  const { data: recommendedVersions } = useGetSwitchDefaultFirmwareListV1002Query({ params })
  const { parseSwitchVersion } = useSwitchFirmwareUtils()

  if(!latestVersions && !recommendedVersions) return <></>

  const versionInfo = []

  for (const key in SwitchFirmwareModelGroup) {
    const modelGroupValue = SwitchFirmwareModelGroup[key as keyof typeof SwitchFirmwareModelGroup]
    const latestVersion = latestVersions?.filter(
      v => v.modelGroup === modelGroupValue)[0]
    const recommendedVersion = recommendedVersions?.filter(
      v => v.modelGroup === modelGroupValue)[0]


    if (latestVersion) {
      versionInfo.push({
        label: modelGroupDisplayText[modelGroupValue],
        firmware: {
          version: parseSwitchVersion(latestVersion.versions[0]?.name),
          category: FirmwareCategory.LATEST,
          releaseDate: latestVersion.versions[0]?.createdDate,
          recommendedVersion: parseSwitchVersion(recommendedVersion?.versions[0]?.name || ''),
          recommendedCategory: FirmwareCategory.RECOMMENDED,
          recommendedDate: recommendedVersion?.versions[0]?.createdDate
        }
      })
    }
  }

  return (
    <SwitchFirmwareBanner data={versionInfo} />
  )
}

export default VersionBanner



