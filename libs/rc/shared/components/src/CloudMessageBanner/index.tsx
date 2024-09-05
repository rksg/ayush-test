
import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Alert, Button, useLayoutContext }     from '@acx-ui/components'
import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import {
  useLazyGetSwitchVenueVersionListQuery,
  useLazyGetVenueEdgeFirmwareListQuery,
  useLazyGetScheduledFirmwareQuery,
  useLazyGetSwitchVenueVersionListV1001Query
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                             from '@acx-ui/types'
import {
  CloudVersion,
  getUserSettingsByPath,
  useGetPlmMessageBannerQuery,
  useGetAllUserSettingsQuery,
  useGetCloudVersionQuery,
  UserSettingsUIModel,
  hasRoles
} from '@acx-ui/user'

import { useIsEdgeFeatureReady } from '../useEdgeActions'

export function CloudMessageBanner () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const isEdgeScheduleUpdateReady = useIsEdgeFeatureReady(Features.EDGES_SCHEDULE_UPGRADE_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isUpgradeByModelEnabled = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)
  const isPtenantRbacApiEnabled = useIsSplitOn(Features.PTENANT_RBAC_API)
  const isSwitchFirmwareV1002Enabled = useIsSplitOn(Features.SWITCH_FIRMWARE_V1002_TOGGLE)
  const layout = useLayoutContext()

  const linkToAdministration = useTenantLink('/administration/')
  const dismissUpgradeSchedule = 'COMMON$dismiss-upgrade-schedule'

  const [version, setVersion] = useState({} as unknown as CloudVersion)
  const [newWifiScheduleExists, setNewWifiScheduleExists] = useState(false)
  const [newSwitchScheduleExists, setNewSwitchScheduleExists] = useState(false)
  const [newEdgeScheduleExists, setNewEdgeScheduleExists] = useState(false)
  const [upgradeMessageTitle, setUpgradeMessageTitle] = useState('')

  const { data } = useGetPlmMessageBannerQuery({ params })
  const { data: userSettings } = useGetAllUserSettingsQuery({ params,
    enableRbac: isPtenantRbacApiEnabled })
  const { data: cloudVersion } = useGetCloudVersionQuery({ params })
  const [getCloudScheduleVersion] = useLazyGetScheduledFirmwareQuery()
  const [getSwitchVenueVersionList] = useLazyGetSwitchVenueVersionListQuery()
  const [getSwitchVenueVersionListV1001] = useLazyGetSwitchVenueVersionListV1001Query()
  const [getVenueEdgeFirmwareList] = useLazyGetVenueEdgeFirmwareListQuery()

  const hidePlmMessage = !!sessionStorage.getItem('hidePlmMessage')
  const plmMessageExists = !!(data && data.description) && !hidePlmMessage
  const isSpecialRole = hasRoles([
    RolesEnum.DPSK_ADMIN, RolesEnum.GUEST_MANAGER, RolesEnum.REPORTS_ADMIN])

  useEffect(() => {
    if(cloudVersion && userSettings) {
      setVersion(version)
      if(!isSpecialRole) {
        checkWifiScheduleExists()
        checkSwitchScheduleExists()
        if(isEdgeScheduleUpdateReady) {
          checkEdgeScheduleExists()
        }
      }
    }
  }, [cloudVersion, userSettings])

  const checkWifiScheduleExists = async () => {
    return await getCloudScheduleVersion({ params, enableRbac: isUpgradeByModelEnabled }).unwrap()
      .then(cloudScheduleVersion => {
        if (!cloudScheduleVersion) return

        const updateVersion = {
          ...version,
          scheduleVersionList: cloudScheduleVersion.scheduleVersionList
        }
        setVersion(updateVersion)
        setNewWifiScheduleExists(
          isThereNewSchedule(
            updateVersion as CloudVersion,
            userSettings as UserSettingsUIModel,
            dismissUpgradeSchedule
          )
        )
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const checkSwitchScheduleExists = async () => {
    if (isSwitchFirmwareV1002Enabled) {
      return await getSwitchVenueVersionListV1001({ params })
        .unwrap()
        .then(result => {
          const upgradeVenueViewList = result?.data ?? []
          setNewSwitchScheduleExists(upgradeVenueViewList.filter(
            item => item.nextSchedule).length > 0
          )
        }).catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })

    } else {
      return await getSwitchVenueVersionList({ params, enableRbac: isSwitchRbacEnabled })
        .unwrap()
        .then(result => {
          const upgradeVenueViewList = result?.data ?? []
          setNewSwitchScheduleExists(upgradeVenueViewList.filter(
            item => item.nextSchedule).length > 0
          )
        }).catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })

    }

  }

  const checkEdgeScheduleExists = async () => {
    return await getVenueEdgeFirmwareList({})
      .unwrap()
      .then(result => {
        const upgradeVenueViewList = result ?? []
        setNewEdgeScheduleExists(upgradeVenueViewList.some(
          item => item.nextSchedule))
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  useEffect(() => {
    const showUpgradeSchedule = (
      newWifiScheduleExists ||
      newSwitchScheduleExists ||
      newEdgeScheduleExists
    )
    setUpgradeMessageTitle(showUpgradeSchedule
      ? $t({ defaultMessage: 'An upgrade schedule for the new firmware version is available.' })
      : '')

    if (plmMessageExists) {
      layout.setShowMessageBanner(true)
    } else if (showUpgradeSchedule) {
      layout.setShowMessageBanner(true)
    } else {
      layout.setShowMessageBanner(false)
    }
  // eslint-disable-next-line max-len
  }, [$t, newWifiScheduleExists, newSwitchScheduleExists, newEdgeScheduleExists, layout, plmMessageExists])

  const showVScheduleInfo = () => {
    if (newWifiScheduleExists) {
      navigate(`${linkToAdministration.pathname}/fwVersionMgmt/apFirmware`)
    } else if (newSwitchScheduleExists) {
      navigate(`${linkToAdministration.pathname}/fwVersionMgmt/switchFirmware`)
    } else if(newEdgeScheduleExists) {
      navigate(`${linkToAdministration.pathname}/fwVersionMgmt/edgeFirmware`)
    }
  }

  return layout.showMessageBanner ? <Alert type='info'
    showIcon
    closable={!!plmMessageExists}
    onClose={()=>{
      layout.setShowMessageBanner(false)
      sessionStorage.setItem('hidePlmMessage', 'true')
    }}
    message={plmMessageExists ? data?.description :
      upgradeMessageTitle ? <Space>{upgradeMessageTitle}
        <Button type='link'
          size='small'
          onClick={showVScheduleInfo}>
          { $t({ defaultMessage: 'More details' }) }
        </Button>
      </Space> : ''}
  /> : null
}

const isThereNewSchedule = (
  version: CloudVersion,
  userSettings: UserSettingsUIModel,
  dismissUpgradeSchedule: string
) => {
  const dismissedUpgradeVersionInDB = getUserSettingsByPath(userSettings, dismissUpgradeSchedule)
  return version?.scheduleVersionList
  && version?.scheduleVersionList.length > 0
  && !dismissedUpgradeVersionInDB
}
