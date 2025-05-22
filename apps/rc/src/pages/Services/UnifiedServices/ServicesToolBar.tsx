import { useEffect } from 'react'

import { Select, Space } from 'antd'
import { debounce }      from 'lodash'
import { useIntl }       from 'react-intl'

import { RadioCardCategory, Table } from '@acx-ui/components'
import { UnifiedServiceCategory }   from '@acx-ui/rc/utils'

export enum ServiceSortOrder {
  ASC,
  DESC,
}

export interface ServiceFiltersConfig {
  products?: RadioCardCategory[]
  categories?: UnifiedServiceCategory[]
}

export interface ServicesToolBarProps {
  setSearchTerm: (searchTerm: string) => void
  setFilters: React.Dispatch<React.SetStateAction<ServiceFiltersConfig>>
  defaultSortOrder?: ServiceSortOrder
  setSortOrder: (sort: ServiceSortOrder) => void
}

export function ServicesToolBar (props: ServicesToolBarProps) {
  const { setSearchTerm, setFilters, defaultSortOrder, setSortOrder } = props
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
        options={[
          { label: $t({ defaultMessage: 'Wi-Fi' }), value: RadioCardCategory.WIFI },
          { label: $t({ defaultMessage: 'Switch' }), value: RadioCardCategory.SWITCH },
          { label: $t({ defaultMessage: 'RUCKUS Edge' }), value: RadioCardCategory.EDGE }
        ]}
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
        options={[
          {
            label: $t({ defaultMessage: 'Authentication & Identity Management' }),
            value: UnifiedServiceCategory.AUTHENTICATION_IDENTITY
          },
          {
            label: $t({ defaultMessage: 'Security & Access Control' }),
            value: UnifiedServiceCategory.SECURITY_ACCESS_CONTROL
          },
          {
            label: $t({ defaultMessage: 'Network Configuration & Services' }),
            value: UnifiedServiceCategory.NETWORK_SERVICES
          },
          {
            label: $t({ defaultMessage: 'Monitoring & Troubleshooting' }),
            value: UnifiedServiceCategory.MONITORING_TROUBLESHOOTING
          },
          {
            label: $t({ defaultMessage: 'User Experience & Portals' }),
            value: UnifiedServiceCategory.USER_EXPERIENCE_PORTALS
          }
        ]}
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
