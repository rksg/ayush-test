import { useEffect, useState } from 'react'

import _ from 'lodash'

import { useGetSigPackQuery }                                             from '@acx-ui/rc/services'
import { ApplicationConfirmType, ApplicationInfo, ApplicationUpdateType } from '@acx-ui/rc/utils'

export function useSigPackDetails () {
  const [ updateAvailable, setUpdateAvailable ] = useState(false)
  const [ added, setAdded ] = useState([] as ApplicationInfo[])
  const [ updated, setUpdated ] = useState([] as ApplicationInfo[])
  const [ merged, setMerged ] = useState([] as ApplicationInfo[])
  const [ removed, setRemoved ] = useState([] as ApplicationInfo[])
  const [ renamed, setRenamed ] = useState([] as ApplicationInfo[])
  const [ confirmationType, setConfirmationType ] = useState(ApplicationConfirmType.NEW_APP_ONLY)
  const [ rulesCount, setRulesCount ] = useState(0)
  const { data, isFetching, isLoading } =
    useGetSigPackQuery({ params: { changesIncluded: 'true' } })

  useEffect(() => {
    if(data && data.changedApplications?.length) {
      setUpdateAvailable(true)
      setAdded(data.changedApplications.filter(item => item.type ===
        ApplicationUpdateType.APPLICATION_ADDED))
      setUpdated(data.changedApplications.filter(item => item.type ===
        ApplicationUpdateType.CATEGORY_UPDATED).sort((a, b) =>
        (b.impactedItems?.length||0)-(a.impactedItems?.length||0)))
      setMerged(data.changedApplications.filter(item => item.type ===
        ApplicationUpdateType.APPLICATION_MERGED).sort((a, b) =>
        (b.impactedItems?.length||0)-(a.impactedItems?.length||0)))
      setRemoved(data.changedApplications.filter(item => item.type ===
        ApplicationUpdateType.APPLICATION_REMOVED).sort((a, b) =>
        (b.impactedItems?.length||0)-(a.impactedItems?.length||0)))
      setRenamed(data.changedApplications.filter(item => item.type ===
        ApplicationUpdateType.APPLICATION_RENAMED).sort((a, b) =>
        (b.impactedItems?.length||0)-(a.impactedItems?.length||0)))
    } else {
      setUpdateAvailable(false)
    }
  }, [data])

  useEffect(()=>{
    const updatedCount = (): number => {
      return Number(!!renamed.length) + Number(!!updated.length) + Number(!!merged.length)
    }
    const updatedWithAddedCount = (): number => {
      return Number(!!added.length) + updatedCount()
    }
    if(added.length && !removed.length && (updatedCount() === 0)){
      setConfirmationType(ApplicationConfirmType.NEW_APP_ONLY)
    } else if(removed.length && (updatedWithAddedCount() === 0)){
      setConfirmationType(ApplicationConfirmType.REMOVED_APP_ONLY)
      setRulesCount(_.sumBy(removed, (item)=>item.impactedItems?.length||0))
    } else if(!added.length && !removed.length && updatedCount() === 1){
      setConfirmationType(ApplicationConfirmType.UPDATED_APP_ONLY)
      setRulesCount(_.sumBy(updated, (item)=>item.impactedItems?.length||0) +
      _.sumBy(merged, (item)=>item.impactedItems?.length||0) +
      _.sumBy(renamed, (item)=>item.impactedItems?.length||0))
    } else if(!removed.length && (updatedWithAddedCount() > 1)){
      setConfirmationType(ApplicationConfirmType.UPDATED_APPS)
    } else if(removed.length && (updatedWithAddedCount() >= 1)){
      setConfirmationType(ApplicationConfirmType.UPDATED_REMOVED_APPS)
    }
  },[added, removed, renamed, updated, merged])


  return {
    data,
    added,
    updated,
    merged,
    removed,
    renamed,
    updateAvailable,
    confirmationType,
    rulesCount,
    isFetching,
    isLoading
  }
}
