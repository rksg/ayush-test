import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'

import { showActionModal, StepsFormLegacy, Table, TableProps } from '@acx-ui/components'
import {
  PortProfileUI,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getIntl }                       from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import PortProfileContext       from './PortProfileContext'
import { PortProfileModal }     from './PortProfileModal'
import { portProfilesUIParser } from './PortProfileModal.utils'

export function PortProfileSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const [ editMode, setEditMode ] = useState(false)
  const [ portModalVisible, setPortModalVisible ] = useState(false)
  const [ portProfilesTable, setPortProfilesTable ] = useState<PortProfileUI[]>([])
  const [ portProfileSettingValues, setPortProfileSettingValues ] = useState<PortProfileUI>()

  useEffect(() => {
    if(currentData.portProfiles){
      form.setFieldValue('portProfiles', currentData.portProfiles)
      setPortProfilesTable(portProfilesUIParser(currentData.portProfiles))
    }
  }, [currentData])

  const portProfileColumns: TableProps<PortProfileUI>['columns']= [{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'models',
    key: 'models',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('model', defaultSort) },
    render: (_, { models }) => {
      return models.join(', ')
    }
  }, {
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'portProfileId',
    key: 'portProfileId',
    sorter: { compare: sortProp('portProfileId', defaultSort) }
  }]

  const rowActions: TableProps<PortProfileUI>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        setEditMode(true)
        console.log(selectedRows[0])
        setPortProfileSettingValues(selectedRows[0])
        setPortModalVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Port Profile' }),
            entityValue: id
          },
          onOk: async () => {
            const portProfiles = portProfilesTable?.filter(row => {
              return row.id !== id
            })
            setPortProfilesTable(portProfiles)
            form.setFieldValue('portProfiles', portProfiles)
            clearSelection()
          }
        })
      }
    }
  ]

  const onCancel = () => {
    setPortModalVisible(false)
  }

  const onSave = () => {
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'Port Profile' })} />
          <Table
            rowKey='name'
            rowActions={filterByAccess(rowActions)}
            columns={portProfileColumns}
            dataSource={portProfilesTable}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add Port Profile' }),
              onClick: () => {
                setEditMode(false)
                setPortModalVisible(true)
              }
            }])}
            rowSelection={hasPermission() && {
              type: 'radio'
            }}
          />
        </Col>
      </Row>

      <PortProfileContext.Provider value={{
        portProfileSettingValues: portProfileSettingValues ?? {} as PortProfileUI,
        setPortProfileSettingValues,
        editMode
      }}>
        <PortProfileModal
          visible={portModalVisible}
          editMode={editMode}
          onCancel={onCancel}
          onSave={onSave}
        />
      </PortProfileContext.Provider>
    </>
  )
}
