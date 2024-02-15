import { useState } from 'react'
import React        from 'react'

import { Checkbox, Space } from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import {
  Button,
  Drawer
} from '@acx-ui/components'
import { useVenuesListQuery } from '@acx-ui/rc/services'

interface SelectVenuesDrawerProps {
  visible: boolean
  tenantIds?: string[]
  setVisible: (visible: boolean) => void
//   setSelected?: (selected: MspAdministrator[]) => void
}

const venuesListPayload = {
  fields: ['name', 'country', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const SelectVenuesDrawer = (props: SelectVenuesDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible } = props
  const [resetField, setResetField] = useState(false)
  //   const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])

  const { data: venuesList }
  = useVenuesListQuery({ params: useParams(), payload: venuesListPayload })


  const onClose = () => {
    setVisible(false)
    // setSelectedRows([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const handleSave = () => {
    // let selMspAdmins: SelectedMspMspAdmins[] = []
    // selectedRows.forEach((element:MspAdministrator) => {
    //   const role = selectedRoles.find(row => row.id === element.id)?.role ?? element.role
    //   selMspAdmins.push ({
    //     mspAdminId: element.id,
    //     mspAdminRole: role as RolesEnum
    //   })
    // })
    // let assignedEcMspAdmins: AssignedMultiEcMspAdmins[] = []
    // tenantIds.forEach((id: string) => {
    //   assignedEcMspAdmins.push ({
    //     operation: 'ADD',
    //     mspEcId: id,
    //     mspAdminRoles: selMspAdmins
    //   })
    // })

    // saveMspAdmins({ params, payload: { associations: assignedEcMspAdmins } })
    //   .then(() => {
    //     setSelected(selectedRows)
    //     setVisible(false)
    //     resetFields()
    //   })
    resetFields()
    setVisible(false)
  }

  const content =
    <Space direction='vertical'>
      <Checkbox>Select All</Checkbox>
      <div style={{ marginLeft: '22px' }}>
        <Space direction='vertical'>
          {venuesList?.data?.map((item) => {
            return (<Checkbox>{item.name}
            </Checkbox>
            )})}
        </Space>
      </div>
    </Space>

  const footer =<div>
    <Button
    //   disabled={selectedRows.length === 0}
      onClick={() => handleSave()}
      type='primary'
    >
      {$t({ defaultMessage: 'Save Selection' })}
    </Button>

    <Button onClick={() => {
      setVisible(false)
    }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Select Venues' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={420}
    >
      {content}
    </Drawer>
  )
}
