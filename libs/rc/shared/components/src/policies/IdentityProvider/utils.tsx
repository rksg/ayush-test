import { cloneDeep, omit } from 'lodash'

import { IdentityProvider } from '@acx-ui/rc/utils'

export function updateRowIds<T extends Object> (data: Array<T>) {
  return data.map((item, i) => ({
    ...item,
    rowId: i
  }))
}

export function removeRowIds<T extends Object> (data: Array<T>) {
  return data.map((item) => ( omit(item, ['rowId'])))
}

export function AddRowIdToIdentityProvider (data: IdentityProvider) {
  const newData = cloneDeep(data)
  const { naiRealms, plmns, roamConsortiumOIs } = newData

  if (naiRealms) {
    const newRealms = naiRealms.map(realm => {
      const { eaps } = realm
      if (eaps) {
        realm.eaps = updateRowIds(eaps)
      }

      return realm
    })

    newData.naiRealms = updateRowIds(newRealms)
  }

  if (plmns) {
    const newPlmns = updateRowIds(plmns)
    newData.plmns = newPlmns
  }

  if (roamConsortiumOIs) {
    const newRois = updateRowIds(roamConsortiumOIs)
    newData.roamConsortiumOIs = newRois
  }

  return newData
}