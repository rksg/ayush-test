import { useEffect } from 'react'

import { Select }                         from 'antd'
import { SelectProps, DefaultOptionType } from 'antd/lib/select'

import { useSearchPersonaGroupListQuery } from '@acx-ui/rc/services'

export function PersonaGroupSelect (props: {
  filterProperty?: boolean,
  whiteList?: string[],
  defaultOptions?: DefaultOptionType[],
  onRefetch?: (refetch: () => void) => void
} & SelectProps) {
  const { filterProperty, whiteList, defaultOptions, onRefetch, ...customSelectProps } = props

  const { data, refetch } = useSearchPersonaGroupListQuery({
    payload: {
      page: 1,
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  const personaGroupList = data?.data
    .filter(group =>
      filterProperty
        ? whiteList?.find(id => id === group.id) || !group.propertyId
        : true)
    .filter(group => filterProperty ? !!group.dpskPoolId : true)  // Avoid the user select group without DPSK pool associated
    .map(group => ({ value: group.id, label: group.name })) ?? []

  // Expose the refetch function to the parent
  useEffect(() => {
    if (onRefetch) {
      onRefetch(refetch) // Callback to pass the refetch function to the parent
    }
  }, [onRefetch, refetch])

  return (
    <Select
      {...customSelectProps}
      showSearch
      filterOption={(input, option) =>
        ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
      }
      options={
        defaultOptions ? defaultOptions.concat(personaGroupList) : personaGroupList
      }
    />
  )
}
