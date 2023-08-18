import { Key, useEffect, useState } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/react'
import { Col, Row }            from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { ContentSwitcher, ContentSwitcherProps, Loader, NoData, showActionModal, Table, TableProps }   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                      from '@acx-ui/feature-toggle'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType }                                             from '@acx-ui/rc/components'
import { useDeleteSubInterfacesMutation, useGetSubInterfacesQuery, useImportSubInterfacesCSVMutation } from '@acx-ui/rc/services'
import { DEFAULT_PAGINATION, EdgeSubInterface, useTableQuery }                                         from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                                   from '@acx-ui/user'

import { EdgePortWithStatus } from '../PortsGeneral/PortConfigForm'
import * as UI                from '../styledComponents'

import SubInterfaceDrawer from './SubInterfaceDrawer'

interface SubInterfaceProps {
  data: EdgePortWithStatus[]
}

interface SubInterfaceTableProps {
  index: number
  ip: string
  mac: string
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>
}

const importTemplateLink = 'assets/templates/sub-interfaces_import_template.csv'

const SubInterfaceTable = (props: SubInterfaceTableProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const isEdgeSubInterfaceCSVEnabled = useIsSplitOn(Features.EDGES_SUB_INTERFACE_CSV_TOGGLE)
  const { mac } = props

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [importModalvisible, setImportModalvisible] = useState(false)
  const [currentEditData, setCurrentEditData] = useState<EdgeSubInterface>()
  const [selectedRows, setSelectedRows] = useState<Key[]>([])

  const tableQuery = useTableQuery<EdgeSubInterface>({
    useQuery: useGetSubInterfacesQuery,
    defaultPayload: {},
    apiParams: { mac }
  })
  const [deleteSubInterfaces] = useDeleteSubInterfacesMutation()
  const [uploadCSV, uploadCSVResult] = useImportSubInterfacesCSVMutation()

  useEffect(() => {
    setDrawerVisible(false)
    setSelectedRows([])
    tableQuery.setPayload(DEFAULT_PAGINATION)
  }, [props.mac])

  useEffect(() => {
    if (params.activeSubTab !== 'sub-interface') {
      setDrawerVisible(false)
    }
  }, [params])

  const columns: TableProps<EdgeSubInterface>['columns'] = [
    {
      title: '#',
      key: '',
      dataIndex: 'index',
      render: (_, __, index) => {
        const pagination = tableQuery.pagination
        return ++index + (pagination.page - 1) * pagination.pageSize
      }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType'
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet'
    },
    {
      title: $t({ defaultMessage: 'VLAN' }),
      key: 'vlan',
      dataIndex: 'vlan'
    }
  ]

  const rowActions: TableProps<EdgeSubInterface>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        openDrawer(selectedRows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Sub-Interface' }),
            entityValue: selectedRows[0].vlan.toString(),
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            deleteSubInterfaces({
              params: {
                ...params,
                mac,
                subInterfaceId: selectedRows[0].id }
            }).then(clearSelection)
          }
        })
      }
    }
  ]

  const actionButtons = [
    {
      label: $t({ defaultMessage: 'Add Sub-interface' }),
      onClick: () => openDrawer()
    },
    ...(isEdgeSubInterfaceCSVEnabled ? [{
      label: $t({ defaultMessage: 'Import from file' }),
      onClick: () => setImportModalvisible(true)
    }]:[])
  ]

  const openDrawer = (data?: EdgeSubInterface) => {
    setCurrentEditData(data)
    setDrawerVisible(true)
  }

  const importSubInterfaces = async (formData: FormData) => {
    try {
      await uploadCSV({
        params: { ...params , mac },
        payload: formData
      }).unwrap()
      setImportModalvisible(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <UI.IpAndMac>
        {
          $t(
            { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
            { ip: props.ip || 'N/A', mac: props.mac }
          )
        }
      </UI.IpAndMac>
      <Row>
        <Col span={12}>
          <SubInterfaceDrawer
            mac={props.mac}
            visible={drawerVisible}
            setVisible={setDrawerVisible}
            data={currentEditData}
          />
          <Loader states={[tableQuery]}>
            <Table<EdgeSubInterface>
              actions={filterByAccess(actionButtons)}
              dataSource={tableQuery?.data?.data}
              pagination={tableQuery.pagination}
              onChange={tableQuery.handleTableChange}
              columns={columns}
              rowActions={filterByAccess(rowActions)}
              rowSelection={hasAccess() && {
                type: 'radio',
                selectedRowKeys: selectedRows,
                onChange: (key: Key[]) => {
                  setSelectedRows(key)
                }
              }}
              rowKey='id'
            />
            { isEdgeSubInterfaceCSVEnabled &&
              <ImportFileDrawer
                type={ImportFileDrawerType.EdgeSubInterface}
                title={$t({ defaultMessage: 'Import from file' })}
                maxSize={CsvSize['5MB']}
                acceptType={['csv']}
                templateLink={importTemplateLink}
                visible={importModalvisible}
                isLoading={uploadCSVResult.isLoading}
                importError={uploadCSVResult.error as FetchBaseQueryError}
                importRequest={importSubInterfaces}
                onClose={() => setImportModalvisible(false)}
              />}
          </Loader>
        </Col>
      </Row>
    </>
  )
}

const SubInterface = (props: SubInterfaceProps) => {

  const { data } = props
  const { $t } = useIntl()
  const [tabDetails, setTabDetails] = useState<ContentSwitcherProps['tabDetails']>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    setTabDetails(data.map((item, index) => {
      return {
        label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
        value: 'port_' + (index + 1),
        children: <SubInterfaceTable
          index={index}
          ip={item.statusIp}
          mac={item.mac}
          setIsFetching={setIsFetching} />
      }
    }))
  }, [data, $t])

  return (
    data.length > 0 ?
      <Loader states={[{
        isLoading: false,
        isFetching: isFetching
      }]}>
        <ContentSwitcher
          tabDetails={tabDetails}
          defaultValue={'port_1'}
          size='large'
          align='left'
        />
      </Loader>
      : <NoData />
  )
}

export default SubInterface
