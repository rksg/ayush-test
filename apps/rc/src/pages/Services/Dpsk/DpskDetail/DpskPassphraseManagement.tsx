import { useState } from 'react'

import { Form, Input, Space } from 'antd'
import { useIntl }            from 'react-intl'

import {
  Button,
  Loader,
  Modal,
  ModalType,
  showActionModal,
  showToast,
  Table,
  TableProps
} from '@acx-ui/components'
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
import { useParams } from '@acx-ui/react-router-dom'
import { formatter } from '@acx-ui/utils'

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
    downloadCsv({ params }).unwrap().catch(() => {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'Failed to export passphrases.' })
      })
    })
  }

  const columns: TableProps<NewDpskPassphrase>['columns'] = [
    {
      key: 'createdDate',
      title: $t({ defaultMessage: 'Passphrase Created' }),
      dataIndex: 'createdDate',
      sorter: true,
      defaultSortOrder: 'descend',
      render: function (data) {
        return formatter('dateTimeFormat')(data)
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
      maxSize={CsvSize['5MB']}
      maxEntries={512}
      acceptType={['csv']}
      templateLink='assets/templates/DPSK_import_template_expiration.csv'
      visible={uploadCsvDrawerVisible}
      isLoading={uploadCsvResult.isLoading}
      importRequest={async (formData, values) => {
        const formValues = values as UploadPassphrasesFormFields
        formData.append('usernamePrefix', formValues.usernamePrefix)
        try {
          await uploadCsv({ params, payload: formData }).unwrap()
          setUploadCsvDrawerVisible(false)
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }}
      onClose={() => setUploadCsvDrawerVisible(false)} >
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
    />
    <Loader states={[tableQuery]}>
      <Table<NewDpskPassphrase>
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        actions={actions}
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox' }}
        rowKey='id'
      />
    </Loader>
  </>)
}
