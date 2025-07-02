import { useEffect, useMemo, useState } from 'react'

import { UnifiedService }    from '@acx-ui/rc/utils'
import { RadioCardCategory } from '@acx-ui/types'

import { ServiceFiltersConfig, ServiceSortOrder } from './ServicesToolBar'

export type DefaultSearchFilterValues = {
  filters?: ServiceFiltersConfig
  sortOrder?: ServiceSortOrder
}

export function useUnifiedServiceSearchFilter (
  rawUnifiedServiceList: Array<UnifiedService>,
  defaultValues: DefaultSearchFilterValues,
  settingsId: string
) {
  const {
    filters: defaultFilters = {},
    sortOrder: defaultSortOrder = ServiceSortOrder.ASC
  } = defaultValues
  const [ searchTerm, setSearchTerm ] = useState<string>()
  const [ filters, setFilters ] = useState<ServiceFiltersConfig>(defaultFilters)
  const [ sortOrder, setSortOrder ] = useState<ServiceSortOrder>(defaultSortOrder)

  const filteredServices = useMemo(() => {
    return getFilteredAndSortedServices(rawUnifiedServiceList, { searchTerm, filters }, sortOrder)
  }, [rawUnifiedServiceList, searchTerm, filters, sortOrder])

  useEffect(() => {
    const defaultValues: DefaultSearchFilterValues = { filters, sortOrder }

    sessionStorage.setItem(
      settingsId,
      JSON.stringify(defaultValues)
    )
  }, [filters, sortOrder])

  return { setSearchTerm, setFilters, setSortOrder, filteredServices }
}

function getFilteredAndSortedServices (
  list: Array<UnifiedService>,
  filterOptions: { searchTerm?: string; filters?: ServiceFiltersConfig },
  sortOrder: ServiceSortOrder
): Array<UnifiedService> {
  const { searchTerm, filters = {} } = filterOptions

  const filteredList = list.filter(svc => {
    const { products = [], categories = [] } = filters

    return matchSearchTerm(svc, searchTerm)
      // eslint-disable-next-line max-len
      && (products.length === 0 || products.some((p: RadioCardCategory) => svc.products.includes(p)))
      && (categories.length === 0 || categories.includes(svc.category))
  })

  return filteredList.sort((a, b) => {
    if (sortOrder === ServiceSortOrder.ASC) return a.label.localeCompare(b.label)
    return b.label.localeCompare(a.label)
  })
}

const matchSearchTerm = (svc: UnifiedService, searchTerm?: string) => {
  if (!searchTerm) return true

  const searchStr = searchTerm.toLowerCase()

  return svc.label.toLowerCase().includes(searchStr)
    || (svc.description ?? '').toLowerCase().includes(searchStr)
    || svc.searchKeywords?.some(kw => kw.toLowerCase().includes(searchStr))
}

export function getDefaultSearchFilterValues (settingsId: string): DefaultSearchFilterValues {
  const saved = sessionStorage.getItem(settingsId)
  return saved ? JSON.parse(saved) : {
    sortOrder: ServiceSortOrder.ASC
  }
}