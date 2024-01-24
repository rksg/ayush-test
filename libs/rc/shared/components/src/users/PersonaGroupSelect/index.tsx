import { Select }      from 'antd'
import { SelectProps } from 'antd/lib/select'

import { useGetPersonaGroupListQuery } from '@acx-ui/rc/services'

export function PersonaGroupSelect (props: {
  filterProperty?: boolean,
  whiteList?: string[],
} & SelectProps) {
  const { filterProperty, whiteList, ...customSelectProps } = props

  const personaGroupList = useGetPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 2147483647, sortField: 'name', sortOrder: 'ASC'
    }
  })

  return (
    <Select
      {...customSelectProps}
      showSearch
      filterOption={(input, option) =>
        ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
      }
      options={
        personaGroupList.data?.data
          .filter(group =>
            filterProperty
              ? whiteList?.find(id => id === group.id) || !group.propertyId
              : true)
          .map(group => ({ value: group.id, label: group.name }))
      }
    />
  )
}
