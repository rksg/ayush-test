import React, { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Drawer, Table, TableProps }        from '@acx-ui/components'
import { PropertyManager, PropertyManagerRoleEnum } from '@acx-ui/rc/utils'

import { PropertyManagerDrawer } from '../PropertyManagerDrawer'

interface PropertyManagerSelectProps {
  visible: boolean,
  onClose: () => void
}

export function PropertyManagerSelectDrawer (props: PropertyManagerSelectProps) {
  const { $t } = useIntl()
  const { visible, onClose } = props
  const [drawerVisible, setDrawerVisible] = useState(false)

  useEffect(() => {
    if (!visible) {
      setDrawerVisible(false)
    }
  }, [visible])

  const footer = [
    <div key={'footer'} style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
      <Button key='cancel' onClick={onClose}>
        { $t({ defaultMessage: 'Cancel' }) }
      </Button>
      <Button
        key='submit'
        type={'secondary'}
        // onClick={() => form.submit()}
        // loading={addPersonaGroupState.isLoading || updatePersonaGroupState.isLoading}
      >
        {$t({ defaultMessage: 'Select' })}
      </Button>
    </div>
  ]

  const columns: TableProps<PropertyManager>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'Name' })
    },
    {
      key: 'role',
      dataIndex: 'role',
      title: $t({ defaultMessage: 'Role' })
    },
    {
      key: 'email',
      dataIndex: 'email',
      title: $t({ defaultMessage: 'Email Address' })
    },
    {
      key: 'phone',
      dataIndex: 'phone',
      title: $t({ defaultMessage: 'Phone Number' })
    }
  ]

  // TODO: [API] - integrate with getPropertyManagerList()
  const mockData: PropertyManager[] = [
    {
      name: 'p1',
      role: PropertyManagerRoleEnum.PrimeAdministrator,
      email: 'p1@commscope.com',
      phone: '0912345678'
    }
  ]

  const actions: TableProps<PropertyManager>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Property Manager' }),
      onClick: () => setDrawerVisible(true)
    }
  ]

  const managerTable =
    <Table
      rowKey='name'
      columns={columns}
      dataSource={mockData}
      actions={actions}
      rowSelection={{ type: 'checkbox' }}
    />

  return (
    <>
      <Drawer
        destroyOnClose
        width='430px'
        zIndex={100}
        title={$t({ defaultMessage: 'Select Property Managers' })}
        visible={visible}
        onClose={onClose}
        children={managerTable}
        footer={footer}
      />
      <PropertyManagerDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </>
  )
}
