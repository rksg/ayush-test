import { useEffect } from 'react'

import { Select }      from 'antd'
import { SelectProps } from 'antd/lib/select'

import { useSearchPersonaGroupListQuery } from '@acx-ui/rc/services'
import { PersonaGroup }                   from '@acx-ui/rc/utils'


export function PersonaGroupSelect (props: {
  filterProperty?: boolean,
  whiteList?: string[],
  setIdentityGroups? (personaGroups: PersonaGroup[]): void
} & SelectProps) {
  const { filterProperty, whiteList, setIdentityGroups, ...customSelectProps } = props

  const personaGroupList = useSearchPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC'
    }
  })

  useEffect(() => {
    const personaGroups = personaGroupList.data?.data
    if (setIdentityGroups && personaGroups && personaGroups.length > 0) {
      setIdentityGroups(personaGroups)
    }
  }, [personaGroupList])

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
          .filter(group => filterProperty ? !!group.dpskPoolId : true)  // Avoid the user select group without DPSK pool associated
          .map(group => ({ value: group.id, label: group.name }))
      }
    />
  )
}
