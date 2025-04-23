import { useEffect, useState } from 'react'

import { isEqual } from 'lodash'

import { RadioCardCategory } from '@acx-ui/components'
import { UnifiedService }    from '@acx-ui/rc/utils'

import { ServiceFiltersConfig, ServiceSortOrder } from './ServicesToolBar'

export function useFilteredUnifiedServices (
  rawUnifiedServiceList: Array<UnifiedService>, defaultSortOrder: ServiceSortOrder
) {
  const [ searchTerm, setSearchTerm ] = useState<string>()
  const [ filters, setFilters ] = useState<ServiceFiltersConfig>({})
  const [ sortOrder, setSortOrder ] = useState<ServiceSortOrder>(defaultSortOrder)
  const [ unifiedServices, setUnifiedServices ] = useState<Array<UnifiedService>>([])

  useEffect(() => {
    const result = filterUnifiedServices(rawUnifiedServiceList, { searchTerm, filters }, sortOrder)

    if (isEqual(result, unifiedServices)) return

    setUnifiedServices(result)
  }, [rawUnifiedServiceList, searchTerm, filters, sortOrder])


  return { setSearchTerm, setFilters, setSortOrder, unifiedServices }
}

function filterUnifiedServices (
  list: Array<UnifiedService>,
  filterOptions: { searchTerm?: string; filters?: ServiceFiltersConfig },
  sortOrder: ServiceSortOrder
): Array<UnifiedService> {
  const { searchTerm, filters = {} } = filterOptions

  const filteredList = list.filter(svc => {
    const { products = [], categories = [] } = filters

    return isSearchHit(svc, searchTerm)
      // eslint-disable-next-line max-len
      && (products.length === 0 || products.some((p: RadioCardCategory) => svc.products.includes(p)))
      && (categories.length === 0 || categories.includes(svc.category))
  })

  return filteredList.sort((a, b) => {
    if (sortOrder === ServiceSortOrder.ASC) return a.label.localeCompare(b.label)
    return b.label.localeCompare(a.label)
  })
}

const isSearchHit = (svc: UnifiedService, searchTerm?: string) => {
  if (!searchTerm) return true

  const searchStr = searchTerm.toLowerCase()

  return svc.label.toLowerCase().includes(searchStr)
    || (svc.description ?? '').toLowerCase().includes(searchStr)
    || svc.searchKeywords?.some(kw => kw.toLowerCase().includes(searchStr))
}
