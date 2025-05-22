import { useEffect } from 'react'

import { Select, Space }                             from 'antd'
import { debounce }                                  from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { RadioCardCategory, Table, categoryMapping } from '@acx-ui/components'
import { UnifiedServiceCategory }                    from '@acx-ui/rc/utils'

export enum ServiceSortOrder {
  ASC,
  DESC,
}

const unifiedServiceCategoriesMap: Record<UnifiedServiceCategory, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [UnifiedServiceCategory.AUTHENTICATION_IDENTITY]: defineMessage({ defaultMessage: 'Authentication & Identity Management' }),
  // eslint-disable-next-line max-len
  [UnifiedServiceCategory.SECURITY_ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Security & Access Control' }),
  // eslint-disable-next-line max-len
  [UnifiedServiceCategory.NETWORK_SERVICES]: defineMessage({ defaultMessage: 'Network Configuration & Services' }),
  // eslint-disable-next-line max-len
  [UnifiedServiceCategory.MONITORING_TROUBLESHOOTING]: defineMessage({ defaultMessage: 'Monitoring & Troubleshooting' }),
  // eslint-disable-next-line max-len
  [UnifiedServiceCategory.USER_EXPERIENCE_PORTALS]: defineMessage({ defaultMessage: 'User Experience & Portals' })
}

export interface ServiceFiltersConfig {
  products?: RadioCardCategory[]
  categories?: UnifiedServiceCategory[]
}

export interface ServicesToolBarProps {
  setSearchTerm: (searchTerm: string) => void
  setFilters: React.Dispatch<React.SetStateAction<ServiceFiltersConfig>>
  availableFilters?: ServiceFiltersConfig
  defaultSortOrder?: ServiceSortOrder
  setSortOrder: (sort: ServiceSortOrder) => void
}

export function ServicesToolBar (props: ServicesToolBarProps) {
  // eslint-disable-next-line max-len
  const { setSearchTerm, setFilters, defaultSortOrder, setSortOrder , availableFilters = {} } = props
  const {
    products = [
      RadioCardCategory.WIFI,
      RadioCardCategory.SWITCH,
      RadioCardCategory.EDGE
    ],
    categories = [
      UnifiedServiceCategory.AUTHENTICATION_IDENTITY,
      UnifiedServiceCategory.SECURITY_ACCESS_CONTROL,
      UnifiedServiceCategory.NETWORK_SERVICES,
      UnifiedServiceCategory.MONITORING_TROUBLESHOOTING,
      UnifiedServiceCategory.USER_EXPERIENCE_PORTALS
    ]
  } = availableFilters
  const { $t } = useIntl()

  const handleSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, 500)


  const handleProductFilterChange = (value: RadioCardCategory) => {
    setFilters(filters => ({ ...filters, products: value !== undefined ? [value] : [] }))
  }

  const handleCategoryFilterChange = (value: UnifiedServiceCategory) => {
    setFilters(filters => ({ ...filters, categories: value !== undefined ? [value] : [] }))
  }

  const handleSortOrderChange = (value: ServiceSortOrder) => {
    setSortOrder(value)
  }

  useEffect(() => {
    // cleanup debounced function when component is unmounted
    return () => handleSearchChange.cancel()
  }, [handleSearchChange])

  return (
    <Space size={12}>
      <Table.SearchInput
        onChange={handleSearchChange}
        placeholder={$t({ defaultMessage: 'Search for network controls...' })}
        style={{ width: 300 }}
        maxLength={64}
        allowClear
      />
      <Select<RadioCardCategory>
        key='product'
        onChange={handleProductFilterChange}
        placeholder={$t({ defaultMessage: 'Product' })}
        allowClear
        showArrow
        style={{ width: 160 }}
        showSearch={false}
        maxTagCount='responsive'
        options={products.map((product: RadioCardCategory) => ({
          label: $t(categoryMapping[product].text),
          value: product
        }))}
      />
      <Select<UnifiedServiceCategory>
        key='category'
        onChange={handleCategoryFilterChange}
        placeholder={$t({ defaultMessage: 'Category' })}
        allowClear
        showArrow
        style={{ width: 260 }}
        showSearch={true}
        maxTagCount='responsive'
        options={categories.map((category: UnifiedServiceCategory) => ({
          label: $t(unifiedServiceCategoriesMap[category]),
          value: category
        }))}
      />
      <Select<ServiceSortOrder>
        key='sort'
        defaultValue={defaultSortOrder}
        onChange={handleSortOrderChange}
        showArrow
        style={{ width: 140 }}
        showSearch={false}
        options={[
          {
            label: $t({ defaultMessage: 'Name (A > Z)' }),
            value: ServiceSortOrder.ASC
          },
          {
            label: $t({ defaultMessage: 'Name (Z > A)' }),
            value: ServiceSortOrder.DESC
          }
        ]}
      />
    </Space>
  )
}
