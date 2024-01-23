/* istanbul ignore file */

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
        style={{ width: 300 }}
        options={resourceGroups?.data?.map((rg) => ({
          label: rg.name,
          value: rg.id,
          key: rg.id
        }))}
        placeholder={$t({ defaultMessage: 'Select Resource Group' })}
        value={selectedValue}
        onChange={onChange}
      />
    </Loader>
  )
}
