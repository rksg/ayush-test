import { Select }  from 'antd'
import { useIntl } from 'react-intl'

import { useGetAvailableUsersQuery } from '@acx-ui/analytics/services'
import { Loader }                    from '@acx-ui/components'

export const AvailableUsersSelection = ({
  onChange
}: {
  onChange: CallableFunction
}) => {
  const { $t } = useIntl()
  const availableUsersQuery = useGetAvailableUsersQuery({} as unknown as void, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.map(({ swuId, userName }) => ({ value: swuId, label: userName, key: swuId })),
      isLoading
    })
  })
  return (
    <Loader states={[availableUsersQuery]}>
      <Select
        showSearch
        style={{ width: 350 }}
        placeholder={$t({ defaultMessage: 'Search to Select' })}
        filterOption={(input, option) =>
          ((option?.label as string).toLocaleLowerCase())
            .includes(input.toLocaleLowerCase())}
        filterSort={(optionA, optionB) =>
          ((optionA?.label as string))
            .toLowerCase()
            .localeCompare(((optionB?.label as string)).toLowerCase())
        }
        options={availableUsersQuery?.data as { label: string, value: string, key: string }[]}
        onChange={(_, option) => {
          const { label, value } = option as { label: string, value: string }
          onChange({ id: value, email: label })
        }}
      />
    </Loader>
  )
}
