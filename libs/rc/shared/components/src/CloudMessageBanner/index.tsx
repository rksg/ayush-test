
import { useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Alert, Button, useLayoutContext } from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useLazyGetAllApModelScheduledFirmwareListQuery,
  useLazyGetSwitchVenueVersionListV1001Query,
  useLazyGetVenueEdgeFirmwareListQuery
} from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                             from '@acx-ui/types'
import {
  CloudVersion,
  hasRoles,
  useGetAllUserSettingsQuery,
  useGetCloudVersionQuery,
  useGetPlmMessageBannerQuery
} from '@acx-ui/user'

export function CloudMessageBanner () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const isPtenantRbacApiEnabled = useIsSplitOn(Features.PTENANT_RBAC_API)
  const layout = useLayoutContext()

  const linkToAdministration = useTenantLink('/administration/')

  const [version, setVersion] = useState({} as unknown as CloudVersion)
  const [newWifiScheduleExists, setNewWifiScheduleExists] = useState(false)
  const [newSwitchScheduleExists, setNewSwitchScheduleExists] = useState(false)
  const [newEdgeScheduleExists, setNewEdgeScheduleExists] = useState(false)
  const [upgradeMessageTitle, setUpgradeMessageTitle] = useState('')

  const { data } = useGetPlmMessageBannerQuery({ params })
  const { data: userSettings } = useGetAllUserSettingsQuery({ params,
    enableRbac: isPtenantRbacApiEnabled })
  const { data: cloudVersion } = useGetCloudVersionQuery({ params })
  const [getWifiScheduleVersion] = useLazyGetAllApModelScheduledFirmwareListQuery()
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
        checkEdgeScheduleExists()
      }
    }
  }, [cloudVersion, userSettings])

  const checkWifiScheduleExists = async () => {
    return await getWifiScheduleVersion({}).unwrap()
      .then(cloudScheduleVersion => {
        if (!cloudScheduleVersion) return

        const updateVersion = {
          ...version,
          scheduleVersionList: cloudScheduleVersion.map(item => item.id)
        }
        setVersion(updateVersion)
        setNewWifiScheduleExists(
          cloudScheduleVersion && cloudScheduleVersion.length > 0
        )
      }).catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const checkSwitchScheduleExists = async () => {
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
