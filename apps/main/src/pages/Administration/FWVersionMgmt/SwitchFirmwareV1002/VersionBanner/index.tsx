import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }            from '@acx-ui/feature-toggle'
import {
  useGetSwitchDefaultFirmwareListV1001Query,
  useGetSwitchLatestFirmwareListV1001Query
} from '@acx-ui/rc/services'
import { FirmwareCategory, SwitchFirmwareModelGroup } from '@acx-ui/rc/utils'
import { useSwitchFirmwareUtils }                     from '@acx-ui/switch/components'

import { SwitchFirmwareBanner } from '../../SwitchFirmwareBanner'


export const VersionBanner = () => {
  const params = useParams()

  const { $t } = useIntl()
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const modelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
    [SwitchFirmwareModelGroup.ICX71]: $t({ defaultMessage: 'ICX Models (7150)' }),
    [SwitchFirmwareModelGroup.ICX7X]: $t({ defaultMessage: 'ICX Models (7550-7850)' }),
    [SwitchFirmwareModelGroup.ICX81]: $t({ defaultMessage: 'ICX Models (8100)' }),
    [SwitchFirmwareModelGroup.ICX82]: $t({ defaultMessage: 'ICX Models (8200)' })
  }

  const { data: latestVersions } = useGetSwitchLatestFirmwareListV1001Query({ params })
  const { data: recommendedVersions } = useGetSwitchDefaultFirmwareListV1001Query({ params })
  const { parseSwitchVersion } = useSwitchFirmwareUtils()

  if(!latestVersions && !recommendedVersions) return <></>

  const versionInfo = []

  for (const key in SwitchFirmwareModelGroup) {
    if(!isSupport8100 && key === SwitchFirmwareModelGroup.ICX81) {
      continue
    }
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



