import { Select }  from 'antd'
import { useIntl } from 'react-intl'

import { AvailableUser, useGetAvailableUsersQuery } from '@acx-ui/analytics/services'
import { Loader }                                   from '@acx-ui/components'

export const AvailableUsersSelection = ({
  onChange,
  selectedValue
}: {
  onChange: CallableFunction
  selectedValue?: string
}) => {
  const { $t } = useIntl()
  const availableUsersQuery = useGetAvailableUsersQuery(
    {} as unknown as void,
    { refetchOnMountOrArgChange: 60 }
  )
  return (
    <Loader states={[availableUsersQuery]}>
      <Select
        showSearch
        style={{ width: 350 }}
        placeholder={$t({ defaultMessage: 'Search to select' })}
        filterOption={(input, option) =>
          ((option?.label as string).toLocaleLowerCase())
            .includes(input.toLocaleLowerCase())}
        filterSort={(optionA, optionB) =>
          ((optionA?.label as string))
            .toLowerCase()
            .localeCompare(((optionB?.label as string)).toLowerCase())
        }
        options={availableUsersQuery.data
          ?.map(({ swuId, userName }: AvailableUser) => ({
            value: swuId, label: userName, key: swuId
          }))
        }
        onChange={(_, option) => {
          const { label, value } = option as { label: string, value: string }
          onChange({ id: value, email: label })
        }}
        value={selectedValue}
      />
    </Loader>
  )
}
