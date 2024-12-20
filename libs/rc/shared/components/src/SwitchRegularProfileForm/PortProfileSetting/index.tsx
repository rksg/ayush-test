import { useContext, useEffect, useState } from 'react'

import { Row, Col, Form } from 'antd'

import { showActionModal, StepsFormLegacy, Table, TableProps } from '@acx-ui/components'
import { useIsSplitOn, Features }                              from '@acx-ui/feature-toggle'
import { useSwitchPortProfilesListQuery }                      from '@acx-ui/rc/services'
import {
  PortProfileUI,
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { getIntl }                       from '@acx-ui/utils'

import { ConfigurationProfileFormContext } from '../ConfigurationProfileFormContext'

import PortProfileContext                              from './PortProfileContext'
import { PortProfileModal }                            from './PortProfileModal'
import { portProfilesAPIParser, portProfilesUIParser } from './PortProfileModal.utils'

const payload = {
  fields: [
    'id'
  ],
  page: 1,
  pageSize: 10000,
  sortField: 'id',
  sortOrder: 'ASC'
}

type PortProfileMap = {
  [key: string]: string
}

export function PortProfileSetting () {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const { currentData } = useContext(ConfigurationProfileFormContext)
  const [ editMode, setEditMode ] = useState(false)
  const [ portModalVisible, setPortModalVisible ] = useState(false)
  const [ portProfilesTable, setPortProfilesTable ] = useState<PortProfileUI[]>([])
  const [ portProfileSettingValues, setPortProfileSettingValues ] = useState<PortProfileUI>()
  const [ portProfileMap, setPortProfileMap ] = useState<PortProfileMap>({})
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])

  const { data: portProfilesList } = useSwitchPortProfilesListQuery({
    payload,
    enableRbac: isSwitchRbacEnabled
  })

  useEffect(() => {
    if(currentData.portProfiles){
      form.setFieldValue('portProfiles', currentData.portProfiles)
      setPortProfilesTable(portProfilesUIParser(currentData.portProfiles))
    }

    if(portProfilesList){
      const portProfileMap: PortProfileMap = {}

      portProfilesList.data.forEach(profile => {
        if(profile.id){
          portProfileMap[profile.id] = profile.name
        }
      })

      setPortProfileMap(portProfileMap)
    }
  }, [currentData, portProfilesList])

  const portProfileColumns: TableProps<PortProfileUI>['columns']= [{
    dataIndex: 'id',
    key: 'id',
    show: false
  },{
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'models',
    key: 'models',
    defaultSortOrder: 'ascend',
    sorter: { compare: sortProp('model', defaultSort) },
    render: (_, { models }) => {
      return Array.isArray(models) ? models.join(', ') : models
    }
  }, {
    title: $t({ defaultMessage: 'Profile Name' }),
    dataIndex: 'portProfileId',
    key: 'portProfileId',
    sorter: { compare: sortProp('portProfileId', defaultSort) },
    render: (_, { portProfileId }) => {
      return Array.isArray(portProfileId) ?
        portProfileId.map(id => portProfileMap[id]).join(', ') : portProfileMap[portProfileId]
    }
  }]

  const rowActions: TableProps<PortProfileUI>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows, clearSelection) => {
        setEditMode(true)
        setPortProfileSettingValues(selectedRows[0])
        setPortModalVisible(true)
        clearSelection()
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([{ id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Delete Profile(s)?' }),
          content: $t({ defaultMessage: 'Are you sure you want to delete?' }),
          customContent: {
            action: 'DELETE',
            entityName: '',
            entityValue: undefined
          },
          onOk: async () => {
            const portProfiles = portProfilesTable?.filter(row => {
              return row.id !== id
            })
            setPortProfilesTable(portProfiles)
            form.setFieldValue('portProfiles',
              portProfiles.map(item=>portProfilesAPIParser(item)).flat())
            clearSelection()
          }
        })
      }
    }
  ]

  const onCancel = () => {
    setPortModalVisible(false)
  }

  const onSave = (data: PortProfileUI) => {
    if(data.portProfileId === undefined){
      data.portProfileId = portProfileSettingValues?.portProfileId ?? []
    }

    const filteredByProfileId = portProfilesTable.filter(item => {
      return JSON.stringify(item.portProfileId.sort()) ===
        JSON.stringify(data.portProfileId.sort())
    })

    const filteredByModel = portProfilesTable.filter(item => {
      return JSON.stringify(item.models.sort()) ===
        JSON.stringify(data.models.sort())
    })

    const result = portProfileSettingValues?.id ? portProfilesTable.filter(item => {
      return item.id !== portProfileSettingValues?.id
    }) : portProfilesTable.filter(item => {
      return JSON.stringify(item.portProfileId.sort()) !==
        JSON.stringify(data.portProfileId.sort()) &&
        JSON.stringify(item.models.sort()) !== JSON.stringify(data.models.sort())
    })

    let mergedPortProfiles: PortProfileUI = {
      models: [],
      portProfileId: []
    }

    if(filteredByProfileId.length === 1){
      mergedPortProfiles = {
        ...data,
        models: [...new Set([
          ...data.models,
          ...filteredByProfileId[0].models
        ])]
      }
    }else if(filteredByModel.length === 1){
      mergedPortProfiles = {
        ...data,
        portProfileId: [...new Set([
          ...data.portProfileId,
          ...filteredByModel[0].portProfileId
        ])]
      }
    }else{
      mergedPortProfiles = { ...data }
    }

    const portProfileAPIData = [
      ...result.map(item=>portProfilesAPIParser(item)),
      portProfilesAPIParser(mergedPortProfiles)].flat()

    setPortProfilesTable([...result, mergedPortProfiles])
    form.setFieldValue('portProfiles', portProfileAPIData)
    setSelectedRowKeys([])
    setPortModalVisible(false)
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={20}>
          <StepsFormLegacy.Title children={$t({ defaultMessage: 'Port Profile' })} />
          <Table
            rowKey='models'
            rowActions={filterByAccess(rowActions)}
            columns={portProfileColumns}
            dataSource={portProfilesTable}
            actions={filterByAccess([{
              label: $t({ defaultMessage: 'Add Port Profile' }),
              onClick: () => {
                setSelectedRowKeys([])
                setEditMode(false)
                setPortProfileSettingValues({} as PortProfileUI)
                setPortModalVisible(true)
              }
            }])}
            rowSelection={hasPermission() && {
              type: 'radio', selectedRowKeys
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
