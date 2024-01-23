import { Select }  from 'antd'
import { useIntl } from 'react-intl'

import { useGetResourceGroupsQuery } from '@acx-ui/analytics/services'
import { Loader }                    from '@acx-ui/components'

export const ResourceGroupSelection = ({
  onChange,
  selectedValue
}: {
  onChange: (value: string) => void;
  selectedValue?: string;
}) => {
  const { $t } = useIntl()
  const resourceGroups = useGetResourceGroupsQuery()
  return (
    <Loader states={[resourceGroups]}>
      <Select
        showSearch
        style={{ width: 350 }}
        filterOption={(input, option) =>
          ((option?.label as string).toLocaleLowerCase())
            .includes(input.toLocaleLowerCase())}
        filterSort={(optionA, optionB) =>
          ((optionA?.label as string))
            .toLowerCase()
            .localeCompare(((optionB?.label as string))
              .toLowerCase())
        }
        options={resourceGroups?.data?.map((rg) => ({
          label: rg.name,
          value: rg.id,
          key: rg.id
        }))}
        placeholder={$t({ defaultMessage: 'Search to select' })}
        value={selectedValue}
        onChange={onChange}
      />
    </Loader>
  )
}
