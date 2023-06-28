import { useMemo } from 'react'

import { useGetSigPackQuery } from '@acx-ui/rc/services'
import {
  ApplicationConfirmType,
  ApplicationInfo,
  ApplicationUpdateType
} from '@acx-ui/rc/utils'

export type ChangedAppsInfoMap = {
  [appType in ApplicationUpdateType]?: {
    data: ApplicationInfo[],
    totalImpacted: number
  }
}

export function useSigPackDetails () {
  // eslint-disable-next-line max-len
  const { data, isFetching, isLoading } = useGetSigPackQuery({ params: { changesIncluded: 'true' } })

  const updatedCount = (): number => {
    const updated = changedAppsInfoMap[ApplicationUpdateType.CATEGORY_UPDATED]?.data ?? []
    const merged = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_MERGED]?.data ?? []
    const renamed = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_RENAMED]?.data ?? []

    return Number(!!renamed.length) + Number(!!updated.length) + Number(!!merged.length)
  }
  const updatedWithAddedCount = (): number => {
    const added = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_ADDED]?.data ?? []
    return Number(!!added?.length) + updatedCount()
  }

  // eslint-disable-next-line max-len
  const processConfirmationType = (changedAppsInfoMap: ChangedAppsInfoMap): ApplicationConfirmType => {
    const added = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_ADDED]?.data ?? []
    const removed = changedAppsInfoMap[ApplicationUpdateType.APPLICATION_REMOVED]?.data ?? []

    if (added.length && !removed.length && (updatedCount() === 0)) {
      return ApplicationConfirmType.NEW_APP_ONLY
    } else if (removed.length && (updatedWithAddedCount() === 0)) {
      return ApplicationConfirmType.REMOVED_APP_ONLY
    } else if (!added.length && !removed.length && updatedCount() === 1) {
      return ApplicationConfirmType.UPDATED_APP_ONLY
    } else if (!removed.length && (updatedWithAddedCount() > 1)) {
      return ApplicationConfirmType.UPDATED_APPS
    } else if (removed.length && (updatedWithAddedCount() >= 1)) {
      return ApplicationConfirmType.UPDATED_REMOVED_APPS
    }

    return ApplicationConfirmType.NEW_APP_ONLY // default value, the code flow should not come here
  }

  // eslint-disable-next-line max-len
  const processChangedApplications = (changedApplications?: ApplicationInfo[]): ChangedAppsInfoMap => {
    if (!changedApplications) return {}

    let result: ChangedAppsInfoMap = {}

    changedApplications.forEach((app: ApplicationInfo) => {
      if (result.hasOwnProperty(app.type)) {
        result[app.type]!.data.push(app)
        result[app.type]!.totalImpacted += app.impactedItems?.length ?? 0
      } else {
        result[app.type] = {
          data: [app],
          totalImpacted: app.impactedItems?.length ?? 0
        }
      }
    })

    Object.entries(result).forEach(([, value]) => {
      value.data.sort((a, b) => (b.impactedItems?.length||0) - (a.impactedItems?.length||0))
    })

    return result
  }

  const changedAppsInfoMap = useMemo(() => {
    return processChangedApplications(data?.changedApplications)
  }, [data?.changedApplications])

  const updateAvailable = useMemo(() => {
    return Object.keys(changedAppsInfoMap).length > 0
  }, [changedAppsInfoMap])

  const confirmationType = useMemo(() => {
    return processConfirmationType(changedAppsInfoMap)
  }, [changedAppsInfoMap])


  return {
    data,
    changedAppsInfoMap,
    updateAvailable,
    confirmationType,
    isFetching,
    isLoading
  }
}
