import { useState } from 'react'

import { Form, Input, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  Button,
  Loader,
  Modal,
  ModalType,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { CopyOutlined }              from '@acx-ui/icons'
import { CsvSize, ImportFileDrawer } from '@acx-ui/rc/components'
import {
  useDeleteDpskPassphraseListMutation,
  useDownloadPassphrasesMutation,
  useDpskPassphraseListQuery,
  useUploadPassphrasesMutation
} from '@acx-ui/rc/services'
import {
  ExpirationType,
  NetworkTypeEnum,
  NewDpskPassphrase,
  transformAdvancedDpskExpirationText,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import NetworkForm from '../../../Networks/wireless/NetworkForm/NetworkForm'

import { unlimitedNumberOfDeviceLabel } from './contentsMap'
import DpskPassphraseDrawer             from './DpskPassphraseDrawer'


interface UploadPassphrasesFormFields {
  usernamePrefix: string
}


export default function DpskPassphraseManagement () {
  const intl = useIntl()
  const { $t } = intl
  const [ addPassphrasesDrawerVisible, setAddPassphrasesDrawerVisible ] = useState(false)
  const [ deletePassphrases ] = useDeleteDpskPassphraseListMutation()
  const [ uploadCsv, uploadCsvResult ] = useUploadPassphrasesMutation()
  const [ downloadCsv ] = useDownloadPassphrasesMutation()
  const [ uploadCsvDrawerVisible, setUploadCsvDrawerVisible ] = useState(false)
  const [ networkModalVisible, setNetworkModalVisible ] = useState(false)
  const params = useParams()
  const tableQuery = useTableQuery({
    useQuery: useDpskPassphraseListQuery,
    sorter: {
      sortField: 'createdDate',
      sortOrder: 'desc'
    },
    defaultPayload: {
      fields: ['check-all', 'id', 'passphrase', 'username',
        'vlanId', 'mac', 'numberOfDevices', 'createdDate', 'expirationDate']
    }
  })

  const downloadPassphrases = () => {
    downloadCsv({ params }).unwrap().catch((error) => {
      console.log(error) // eslint-disable-line no-console
    })
  }

  const columns: TableProps<NewDpskPassphrase>['columns'] = [
    {
      key: 'createdDate',
      title: $t({ defaultMessage: 'Passphrase Created' }),
      dataIndex: 'createdDate',
      sorter: true,
      defaultSortOrder: 'descend',
      fixed: 'left',
      render: function (data) {
        return formatter(DateFormatEnum.DateTimeFormat)(data)
      }
    },
    {
      key: 'username',
      title: $t({ defaultMessage: 'User Name' }),
      dataIndex: 'username',
      sorter: true,
      ellipsis: true
    },
    {
      key: 'numberOfDevices',
      title: $t({ defaultMessage: 'No. of Devices' }),
      dataIndex: 'numberOfDevices',
      sorter: false,
      render: function (data) {
        return data ? data : $t(unlimitedNumberOfDeviceLabel)
      }
    },
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: true
    },
    {
      key: 'passphrase',
      title: $t({ defaultMessage: 'Passphrase' }),
      dataIndex: 'passphrase',
      sorter: false,
      render: function (data) {
        return (
          <Space
            direction='horizontal'
            size={2}
            onClick={(e)=> {e.stopPropagation()}}>
            <Input.Password
              readOnly
              bordered={false}
              value={data as string}
            />
            <Button
              type='link'
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard.writeText(data as string)}
            />
          </Space>
        )
      }
    },
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlanId',
      sorter: true
    },
    {
      key: 'expirationDate',
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expirationDate',
      sorter: true,
      render: function (data) {
        if (data) {
          return transformAdvancedDpskExpirationText(intl, {
            expirationType: ExpirationType.SPECIFIED_DATE,
            expirationDate: data as string
          })
        }
        return transformAdvancedDpskExpirationText(intl, { expirationType: null })
      }
    }
  ]

  const rowActions: TableProps<NewDpskPassphrase>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Passphrase' }),
            entityValue: selectedRows[0].username,
            numOfEntities: selectedRows.length
          },
          onOk: () => {
            const passphraseIds = selectedRows.map(p => p.id)
            deletePassphrases({ params, payload: passphraseIds })
            clearSelection()
          }
        })
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Passphrases' }),
      onClick: () => setAddPassphrasesDrawerVisible(true)
    },
    {
      label: $t({ defaultMessage: 'Import From File' }),
      onClick: () => setUploadCsvDrawerVisible(true)
    },
    {
      label: $t({ defaultMessage: 'Export To File' }),
      onClick: () => downloadPassphrases()
    },
    {
      label: $t({ defaultMessage: 'Add DPSK Network' }),
      onClick: () => setNetworkModalVisible(true)
    }
  ]

  const networkForm = <NetworkForm modalMode={true}
    modalCallBack={()=>{
      setNetworkModalVisible(false)
    }}
    createType={NetworkTypeEnum.DPSK}
  />

  return (<>
    <DpskPassphraseDrawer
      visible={addPassphrasesDrawerVisible}
      setVisible={setAddPassphrasesDrawerVisible}
    />
    <ImportFileDrawer type='DPSK'
      title={$t({ defaultMessage: 'Import from file' })}
      maxSize={CsvSize['20MB']}
      maxEntries={5000}
      acceptType={['csv']}
      templateLink='assets/templates/DPSK_import_template_expiration.csv'
      visible={uploadCsvDrawerVisible}
      isLoading={uploadCsvResult.isLoading}
      importRequest={async (formData, values) => {
        const formValues = values as UploadPassphrasesFormFields
        if (formValues.usernamePrefix) {
          formData.append('usernamePrefix', formValues.usernamePrefix)
        }
        try {
          await uploadCsv({ params, payload: formData }).unwrap()
          setUploadCsvDrawerVisible(false)
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }}
      onClose={() => setUploadCsvDrawerVisible(false)}
      extraDescription={[
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Notice: Existing DPSK passphrases with the same MAC address will be overwritten, and the previous passphrase will be unusable' }),
        // eslint-disable-next-line max-len
        $t({ defaultMessage: 'The properties you set here for "User Name Prefix" will not replace any value that you manually define in the imported file' })
      ]}
    >
      <Form.Item
        name='usernamePrefix'
        label={$t({ defaultMessage: 'User name prefix' })}
        children={<Input />}
      />
    </ImportFileDrawer>
    <Modal
      title={$t({ defaultMessage: 'Add DPSK Network' })}
      type={ModalType.ModalStepsForm}
      visible={networkModalVisible}
      mask={true}
      children={networkForm}
      destroyOnClose={true}
    />
    <Loader states={[tableQuery]}>
      <Table<NewDpskPassphrase>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'checkbox' }}
        rowKey='id'
      />
    </Loader>
  </>)
}
