import { useState } from 'react'

import { Menu }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery, useGetAvailableUsersQuery }          from '@acx-ui/analytics/services'
import { Loader, PageHeader, Button, Dropdown, Drawer, Select } from '@acx-ui/components'

import { UsersTable } from './Table'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

export default function Users () {
  const { $t } = useIntl()
  const usersQuery = useGetUsersQuery()
  const availableUsersQuery = useGetAvailableUsersQuery({} as unknown as void, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.map(({ swuId, userName }) => ({ value: swuId, label: userName })),
      isLoading
    })
  })
  const usersCount = usersQuery.data?.length || 0
  const [visible, setVisible] = useState(false)
  const addMenu = <Menu
    items={[{
      key: 'add-internal-user',
      label: <span onClick={()=>setVisible(!visible)}>{$t({ defaultMessage: 'Internal' })}</span>
    }]
    }
  />
  return <Loader states={[usersQuery]}>
    <PageHeader
      title={<>{$t(title,{ usersCount })} ({usersCount})</>}
      extra={[
        <Dropdown overlay={addMenu} placement={'bottomRight'}>{() =>
          <Button type='primary'>{ $t({ defaultMessage: 'Add User...' }) }</Button>
        }</Dropdown>
      ]}
    />
    <Drawer
      width={500}
      title={$t({ defaultMessage: 'Add User' })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <Loader states={[availableUsersQuery]}>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder='Search to Select'
          optionFilterProp='children'
          filterOption={(input, option) =>
            ((option?.label as string).toLocaleLowerCase() ?? '')
              .includes(input.toLocaleLowerCase())}
          filterSort={(optionA, optionB) =>
            ((optionA?.label as string) ?? '')
              .toLowerCase()
              .localeCompare(((optionB?.label as string) ?? '')
                .toLowerCase())
          }
          options={availableUsersQuery?.data as unknown as { label: string, value: string }[]}
        />
      </Loader>
    </Drawer>
    <UsersTable data={usersQuery.data} />
  </Loader>
}
