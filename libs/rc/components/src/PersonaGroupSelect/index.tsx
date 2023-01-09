import { Select }      from 'antd'
import { SelectProps } from 'antd/lib/select'

import { useGetPersonaGroupListQuery } from '@acx-ui/rc/services'

export function PersonaGroupSelect (props: SelectProps) {

  const personaGroupList = useGetPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 2147483647, sortField: 'name', sortOrder: 'ASC'
    }
  })

  return (
    <Select
      {...props}
      options={
        personaGroupList.data?.data
          .map(group => ({ value: group.id, label: group.name }))
      }
    />
  )
}
