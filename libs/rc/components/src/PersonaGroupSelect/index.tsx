import { Select }      from 'antd'
import { SelectProps } from 'antd/lib/select'

import { useGetPersonaGroupListQuery } from '@acx-ui/rc/services'

export function PersonaGroupSelect (props: SelectProps) {

  const personaGroupList = useGetPersonaGroupListQuery({
    params: { size: '2147483647', page: '0' }
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
