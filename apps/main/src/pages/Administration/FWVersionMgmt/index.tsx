import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                            from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { InformationSolid }                         from '@acx-ui/icons'
import {
  useGetLatestEdgeFirmwareQuery,
  useGetLatestFirmwareListQuery,
  useGetSigPackQuery,
  useGetSwitchLatestFirmwareListQuery,
  useGetSwitchVenueVersionListQuery,
  useGetVenueEdgeFirmwareListQuery,
  useGetVenueVersionListQuery
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import ApplicationPolicyMgmt from '../ApplicationPolicyMgmt'

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
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/fwVersionMgmt')
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const enableSigPackUpgrade = useIsSplitOn(Features.SIGPACK_UPGRADE)
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  const { data: venueVersionList } = useGetVenueVersionListQuery({ params })
  const { data: latestSwitchReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const { data: switchVenueVersionList } = useGetSwitchVenueVersionListQuery({ params })
  const { data: edgeVenueVersionList } = useGetVenueEdgeFirmwareListQuery({}, {
    skip: !isEdgeEnabled
  })
  const { latestEdgeReleaseVersion } = useGetLatestEdgeFirmwareQuery({}, {
    skip: !isEdgeEnabled,
    selectFromResult: ({ data }) => ({
      latestEdgeReleaseVersion: data?.[0]
    })
  })
  const { data: sigPackUpdate } = useGetSigPackQuery({ params: { changesIncluded: 'false' } },
    { skip: !enableSigPackUpgrade })
  const [isApFirmwareAvailable, setIsApFirmwareAvailable] = useState(false)
  const [isSwitchFirmwareAvailable, setIsSwitchFirmwareAvailable] = useState(false)
  const [isEdgeFirmwareAvailable, setIsEdgeFirmwareAvailable] = useState(false)
  const [isAPPLibraryAvailable, setIsAPPLibraryAvailable] = useState(false)

  useEffect(()=>{
    if(sigPackUpdate&&sigPackUpdate.currentVersion!==sigPackUpdate.latestVersion){
      setIsAPPLibraryAvailable(true)
    }else{
      setIsAPPLibraryAvailable(false)
    }
  }, [sigPackUpdate])
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
        compareSwitchVersion(latest09.id, fv.switchFirmwareVersion?.id))
      const hasOutdated10 = latest10 && switchVenueVersionList.data.some(fv =>
        compareSwitchVersion(latest10.id, fv.switchFirmwareVersionAboveTen?.id))

      setIsSwitchFirmwareAvailable(hasOutdated09 || hasOutdated10)
    }
  }, [latestSwitchReleaseVersions, switchVenueVersionList])

  useEffect(() => {
    const hasOutdated = edgeVenueVersionList?.some(item=>
      item.versions?.[0].id !== latestEdgeReleaseVersion?.id)
    setIsEdgeFirmwareAvailable(!!hasOutdated)
  }, [edgeVenueVersionList, latestEdgeReleaseVersion])

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
      title: <UI.TabWithHint>{$t({ defaultMessage: 'SmartEdge Firmware' })}
        {isEdgeFirmwareAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new SmartEdge firmware versions available' })} />}
      </UI.TabWithHint>,
      content: <EdgeFirmware />,
      visible: isEdgeEnabled
    },
    appLibrary: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Application Library' })}
        {isAPPLibraryAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new Application update available' })} />}
      </UI.TabWithHint>,
      content: <ApplicationPolicyMgmt />,
      visible: enableSigPackUpgrade
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='apFirmware'
      type='card'
      onChange={onTabChange}
      activeKey={params.activeSubTab}
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
