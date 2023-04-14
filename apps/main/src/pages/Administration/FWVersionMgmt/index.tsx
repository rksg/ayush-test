import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { InformationSolid }       from '@acx-ui/icons'
import {
  useGetLatestFirmwareListQuery,
  useGetSwitchLatestFirmwareListQuery,
  useGetSwitchVenueVersionListQuery,
  useGetVenueVersionListQuery
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import ApFirmware      from './ApFirmware'
import EdgeFirmware    from './EdgeFirmware'
import {
  compareSwitchVersion,
  compareVersions,
  getApVersion,
  getReleaseFirmware
} from './FirmwareUtils'
import * as UI        from './styledComponents'
import SwitchFirmware from './SwitchFirmware'

const FWVersionMgmt = () => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  const { data: venueVersionList } = useGetVenueVersionListQuery({ params })
  const { data: latestSwitchReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const { data: switchVenueVersionList } = useGetSwitchVenueVersionListQuery({ params })

  const [isApFirmwareAvailable, setIsApFirmwareAvailable] = useState(false)
  const [isSwitchFirmwareAvailable, setIsSwitchFirmwareAvailable] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEdgeFirmwareAvailable, setIsEdgeFirmwareAvailable] = useState(false) // TODO: GetDpFirmwareUpgradeAvailable API

  useEffect(()=>{
    if (latestReleaseVersions && venueVersionList) {
      // As long as one of the venues' version smaller than the latest release version, it would be the available
      const latest = [...latestReleaseVersions].sort((a,b)=>
        compareVersions(a.id, b.id)).pop()
      const hasOutdated = venueVersionList.data.some(fv=>
        compareVersions(getApVersion(fv), latest?.id) < 0)
      setIsApFirmwareAvailable(hasOutdated)
    }
  }, [latestReleaseVersions, venueVersionList])

  useEffect(()=>{
    if (latestSwitchReleaseVersions && switchVenueVersionList) {
      const latest09 = getReleaseFirmware(latestSwitchReleaseVersions)[0] // 09010f_b5
      const latest10 = getReleaseFirmware(latestSwitchReleaseVersions)[1] // 10010e
      const hasOutdated09 = latest09 && switchVenueVersionList.data.some(fv=>
        compareSwitchVersion(latest09.id, fv.switchFirmwareVersion.id))
      const hasOutdated10 = latest10 && switchVenueVersionList.data.some(fv=>
        compareSwitchVersion(latest10.id, fv.switchFirmwareVersionAboveTen.id))
      setIsSwitchFirmwareAvailable(hasOutdated09 || hasOutdated10)
    }
  }, [latestSwitchReleaseVersions, switchVenueVersionList])

  const tabs = {
    apFirmware: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'AP Firmware' })}
        {isApFirmwareAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new AP firmware versions available' })} />}
      </UI.TabWithHint>,
      content: <ApFirmware />,
      visible: true
    },
    switchFirmware: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Switch Firmware' })}
        {isSwitchFirmwareAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new Switch firmware versions available' })} />}
      </UI.TabWithHint>,
      content: <SwitchFirmware />,
      visible: true
    },
    edgeFirmware: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Edge Firmware' })}
        {isEdgeFirmwareAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new Edge firmware versions available' })} />}
      </UI.TabWithHint>,
      content: <EdgeFirmware />,
      visible: isEdgeEnabled
    }
  }

  return (
    <Tabs
      defaultActiveKey='apFirmware'
      type='card'
    >
      {
        Object.entries(tabs).map((item) =>
          item[1].visible &&
          <Tabs.TabPane
            key={item[0]}
            tab={item[1].title}
            children={item[1].content}
          />)
      }
    </Tabs>
  )
}

export default FWVersionMgmt
