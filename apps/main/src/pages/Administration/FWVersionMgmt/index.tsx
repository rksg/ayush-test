import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { InformationSolid }       from '@acx-ui/icons'
import { useIsEdgeReady }         from '@acx-ui/rc/components'
import {
  compareVersions,
  getApVersion,
  getReleaseFirmware
} from '@acx-ui/rc/components'
import {
  useGetLatestEdgeFirmwareQuery,
  useGetLatestFirmwareListQuery,
  useGetSigPackQuery,
  useGetSwitchDefaultFirmwareListV1001Query,
  useGetSwitchLatestFirmwareListQuery,
  useGetSwitchVenueVersionListQuery,
  useGetSwitchVenueVersionListV1001Query,
  useGetVenueApModelFirmwareListQuery,
  useGetVenueEdgeFirmwareListQuery,
  useGetVenueVersionListQuery
} from '@acx-ui/rc/services'
import { compareSwitchVersion, SwitchFirmwareModelGroup, FirmwareVenuePerApModel } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                   from '@acx-ui/react-router-dom'
import { getUserProfile, isCoreTier }                                              from '@acx-ui/user'

import ApplicationPolicyMgmt from '../ApplicationPolicyMgmt'

import ApFirmware          from './ApFirmware'
import EdgeFirmware        from './EdgeFirmware'
import * as UI             from './styledComponents'
import SwitchFirmware      from './SwitchFirmware'
import SwitchFirmwareV1002 from './SwitchFirmwareV1002'

const FWVersionMgmt = () => {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/fwVersionMgmt')
  const isEdgeEnabled = useIsEdgeReady()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const isSwitchFirmwareV1002Enabled = useIsSplitOn(Features.SWITCH_FIRMWARE_V1002_TOGGLE)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const isCore = isCoreTier(accountTier)


  const { data: latestSwitchReleaseVersions } =
    useGetSwitchLatestFirmwareListQuery({ params, enableRbac: isSwitchRbacEnabled },
      { skip: isSwitchFirmwareV1002Enabled })

  const { data: recommendedSwitchReleaseVersions } =
    useGetSwitchDefaultFirmwareListV1001Query( { params },
      { skip: !isSwitchFirmwareV1002Enabled })

  const { data: switchVenueVersionList } =
    useGetSwitchVenueVersionListQuery(
      { params, enableRbac: isSwitchRbacEnabled },
      { skip: isSwitchFirmwareV1002Enabled })

  const { data: switchVenueVersionListV1001 } =
    useGetSwitchVenueVersionListV1001Query(
      { params },
      { skip: !isSwitchFirmwareV1002Enabled })

  const { data: edgeVenueVersionList } = useGetVenueEdgeFirmwareListQuery({}, {
    skip: !isEdgeEnabled
  })
  const { latestEdgeReleaseVersion } = useGetLatestEdgeFirmwareQuery({}, {
    skip: !isEdgeEnabled,
    selectFromResult: ({ data }) => ({
      latestEdgeReleaseVersion: data?.[0]
    })
  })

  const { isAPPLibraryAvailable } = useGetSigPackQuery({
    params: { changesIncluded: 'false' },
    enableRbac: isWifiRbacEnabled
  }, {
    skip: isCore,
    selectFromResult: ({ data }) => ({
      isAPPLibraryAvailable: data?.currentVersion !== data?.latestVersion
    })
  })
  const isApFirmwareAvailable = useIsApFirmwareAvailable()
  const [isSwitchFirmwareAvailable, setIsSwitchFirmwareAvailable] = useState(false)
  const [hasRecomendedSwitchFirmware, setHasRecomendedSwitchFirmware] = useState(false)
  const [isEdgeFirmwareAvailable, setIsEdgeFirmwareAvailable] = useState(false)

  useEffect(()=>{
    if (!isSwitchFirmwareV1002Enabled && latestSwitchReleaseVersions && switchVenueVersionList) {
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
    if (isSwitchFirmwareV1002Enabled && recommendedSwitchReleaseVersions
      && switchVenueVersionListV1001) {

      const recommended71 = recommendedSwitchReleaseVersions.filter(
        r => r.modelGroup === SwitchFirmwareModelGroup.ICX71)[0].versions[0].id
      const recommended7X = recommendedSwitchReleaseVersions.filter(
        r => r.modelGroup === SwitchFirmwareModelGroup.ICX7X)[0].versions[0].id
      const recommended82 = recommendedSwitchReleaseVersions.filter(
        r => r.modelGroup === SwitchFirmwareModelGroup.ICX82)[0].versions[0].id

      const hasOutdated71 = recommended71 && switchVenueVersionListV1001.data.some(fv =>
        compareSwitchVersion(recommended71, fv.versions.filter(
          v => v.modelGroup === SwitchFirmwareModelGroup.ICX71)[0]?.version)) || false
      const hasOutdated7X = recommended7X && switchVenueVersionListV1001.data.some(fv =>
        compareSwitchVersion(recommended7X, fv.versions.filter(
          v=> v.modelGroup=== SwitchFirmwareModelGroup.ICX7X)[0]?.version)) || false
      const hasOutdated82 = recommended82 && switchVenueVersionListV1001.data.some(fv =>
        compareSwitchVersion(recommended82, fv.versions.filter(
          v=> v.modelGroup=== SwitchFirmwareModelGroup.ICX82)[0]?.version)) || false

      if (isSupport8100) {
        const recommended81 = recommendedSwitchReleaseVersions.filter(
          r => r.modelGroup === SwitchFirmwareModelGroup.ICX81)[0]?.versions[0].id
        const hasOutdated81 = recommended81 && switchVenueVersionListV1001.data.some(fv =>
          compareSwitchVersion(recommended81, fv.versions.filter(
            v=> v.modelGroup=== SwitchFirmwareModelGroup.ICX81)[0]?.version)) || false
        // eslint-disable-next-line max-len
        setHasRecomendedSwitchFirmware(hasOutdated71 || hasOutdated7X || hasOutdated82 || hasOutdated81)
      } else {
        setHasRecomendedSwitchFirmware(hasOutdated71 || hasOutdated7X || hasOutdated82)
      }
    }
  }, [recommendedSwitchReleaseVersions, switchVenueVersionListV1001])

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
    switchFirmware: isSwitchFirmwareV1002Enabled ? {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Switch Firmware' })}
        {hasRecomendedSwitchFirmware && <Tooltip children={<InformationSolid />}
          // eslint-disable-next-line max-len
          title={$t({ defaultMessage: 'New recommended versions are available' })} />}
      </UI.TabWithHint>,
      content: <SwitchFirmwareV1002 />,
      visible: true
    } : {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Switch Firmware' })}
        {isSwitchFirmwareAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new Switch firmware versions available' })} />}
      </UI.TabWithHint>,
      content: <SwitchFirmware />,
      visible: true
    },
    edgeFirmware: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'RUCKUS Edge Firmware' })}
        {
          isEdgeFirmwareAvailable && <Tooltip children={<InformationSolid />}
            title={
              $t({ defaultMessage: 'There are new RUCKUS Edge firmware versions available' })
            } />
        }
      </UI.TabWithHint>,
      content: <EdgeFirmware />,
      visible: isEdgeEnabled
    },
    appLibrary: {
      title: <UI.TabWithHint>{$t({ defaultMessage: 'Application Library' })}
        {isAPPLibraryAvailable && <Tooltip children={<InformationSolid />}
          title={$t({ defaultMessage: 'There are new Application update available' })} />}
      </UI.TabWithHint>,
      content: isCore ? <></> : <ApplicationPolicyMgmt />,
      visible: !isCore
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


function useIsApFirmwareAvailable () {
  const params = useParams()
  const isUpgradeByModelEnabled = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)
  const [ isApFirmwareAvailable, setIsApFirmwareAvailable ] = useState(false)
  const { data: venueApModelFirmwareList } = useGetVenueApModelFirmwareListQuery(
    { params, payload: {
      fields: ['name', 'id', 'isApFirmwareUpToDate'],
      page: 1, pageSize: 10000
    } },
    { skip: !isUpgradeByModelEnabled }
  )
  // eslint-disable-next-line max-len
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params }, { skip: isUpgradeByModelEnabled })
  // eslint-disable-next-line max-len
  const { data: venueVersionList } = useGetVenueVersionListQuery({ params }, { skip: isUpgradeByModelEnabled })

  useEffect(() => {
    if (!latestReleaseVersions || !venueVersionList) return

    // As long as one of the venues' version smaller than the latest release version, it would be the available
    const latest = [...latestReleaseVersions].sort((a, b) => compareVersions(a.id, b.id)).pop()
    // eslint-disable-next-line max-len
    const hasOutdated = venueVersionList.data.some(fv => compareVersions(getApVersion(fv), latest?.id) < 0)
    setIsApFirmwareAvailable(hasOutdated)
  }, [latestReleaseVersions, venueVersionList])

  useEffect(() => {
    if (!venueApModelFirmwareList?.data) return

    const hasOutdated = venueApModelFirmwareList.data.some(venueApModelFiwmrare => {
      return !isApFirmwareUpToDate(venueApModelFiwmrare.isApFirmwareUpToDate)
    })
    setIsApFirmwareAvailable(hasOutdated)

  }, [venueApModelFirmwareList])

  return isApFirmwareAvailable
}

export function isApFirmwareUpToDate (status?: FirmwareVenuePerApModel['isApFirmwareUpToDate']) {
  return status ?? true
}
