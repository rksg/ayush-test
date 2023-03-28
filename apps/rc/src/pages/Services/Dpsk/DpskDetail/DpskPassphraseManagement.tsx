import { useState } from 'react'

import { Modal as AntModal, Form, Input, Space } from 'antd'
import { RawIntlProvider, useIntl }              from 'react-intl'

import {
  Button,
  Loader,
  Modal,
  ModalRef,
  ModalType,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { CopyOutlined }              from '@acx-ui/icons'
import { CsvSize, ImportFileDrawer } from '@acx-ui/rc/components'
import {
  useDeleteDpskPassphraseListMutation,
  useDownloadPassphrasesMutation,
  useDpskPassphraseListQuery,
  useRevokeDpskPassphraseListMutation,
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
import { getIntl }        from '@acx-ui/utils'

import NetworkForm from '../../../Networks/wireless/NetworkForm/NetworkForm'

import { unlimitedNumberOfDeviceLabel }                 from './contentsMap'
import DpskPassphraseDrawer, { DpskPassphraseEditMode } from './DpskPassphraseDrawer'


interface UploadPassphrasesFormFields {
  usernamePrefix: string
}

export default function DpskPassphraseManagement () {
  const intl = useIntl()
  const { $t } = intl
  const [ addPassphrasesDrawerVisible, setAddPassphrasesDrawerVisible ] = useState(false)
  const [
    passphrasesDrawerEditMode,
    setPassphrasesDrawerEditMode
  ] = useState<DpskPassphraseEditMode>({ isEdit: false })
  const [ deletePassphrases ] = useDeleteDpskPassphraseListMutation()
  const [ uploadCsv, uploadCsvResult ] = useUploadPassphrasesMutation()
  const [ downloadCsv ] = useDownloadPassphrasesMutation()
  const [ revokePassphrases ] = useRevokeDpskPassphraseListMutation()
  const [ uploadCsvDrawerVisible, setUploadCsvDrawerVisible ] = useState(false)
  const [ networkModalVisible, setNetworkModalVisible ] = useState(false)
  const params = useParams()
  const isCloudpathEnabled = useIsSplitOn(Features.DPSK_CLOUDPATH_FEATURE)

  const tableQuery = useTableQuery({
    useQuery: useDpskPassphraseListQuery,
    sorter: {
      sortField: 'createdDate',
      sortOrder: 'desc'
    },
    defaultPayload: {}
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
          <Space direction='horizontal' size={2} onClick={(e)=> {e.stopPropagation()}}>
            <Input.Password readOnly bordered={false} value={data as string} />
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
      label: $t({ defaultMessage: 'Edit Passphrase' }),
      // eslint-disable-next-line max-len
      visible: (selectedRows: NewDpskPassphrase[]) => isCloudpathEnabled && selectedRows.length === 1,
      onClick: ([selectedRow]) => {
        setPassphrasesDrawerEditMode({ isEdit: true, passphraseId: selectedRow.id })
        setAddPassphrasesDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Revoke' }),
      visible: isCloudpathEnabled,
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        showRevokeModal(selectedRows, async (revocationReason: string) => {
          await revokePassphrases({
            params,
            payload: {
              ids: selectedRows.map(p => p.id),
              updateState: 'REVOKE',
              revocationReason
            }
          })
          clearSelection()
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Unrevoke' }),
      visible: isCloudpathEnabled,
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        revokePassphrases({
          params,
          payload: {
            ids: selectedRows.map(p => p.id),
            updateState: 'UNREVOKE'
          }
        }).then(clearSelection)
      }
    },
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
            deletePassphrases({ params, payload: selectedRows.map(p => p.id) })
            clearSelection()
          }
        })
      }
    }
  ]

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Passphrases' }),
      onClick: () => {
        setPassphrasesDrawerEditMode({ isEdit: false })
        setAddPassphrasesDrawerVisible(true)
      }
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
      editMode={passphrasesDrawerEditMode}
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
        formData.append('usernamePrefix', formValues.usernamePrefix)
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

// eslint-disable-next-line max-len
function showRevokeModal (passphrases: NewDpskPassphrase[], onFinish: (revocationReason: string) => Promise<void>) {
  const modal = AntModal.confirm({})
  const { $t } = getIntl()

  const getRevokeTitle = () => {
    return $t({
      defaultMessage: `Revoke "{count, plural,
        one {{entityValue}}
        other {{count} {formattedEntityName}}
      }"?`
    }, {
      count: passphrases.length,
      entityValue: passphrases[0].username,
      formattedEntityName: $t({ defaultMessage: 'Passphrases' })
    })
  }

  const content = <RevokeForm modal={modal} onFinish={onFinish} />

  modal.update({
    title: getRevokeTitle(),
    okText: $t({ defaultMessage: 'OK' }),
    cancelText: $t({ defaultMessage: 'Cancel' }),
    maskClosable: false,
    keyboard: false,
    content: <RawIntlProvider value={getIntl()} children={content} />,
    icon: <> </>
  })
}

function RevokeForm (props: {
  modal: ModalRef,
  onFinish: (revocationReason: string) => Promise<void>
}) {
  const { $t } = getIntl()
  const { modal, onFinish } = props
  const [ form ] = Form.useForm()

  modal.update({
    onOk: async () => {
      await onFinish(form.getFieldValue('reason'))
    },
    okButtonProps: { disabled: true }
  })

  return (
    <Form form={form} layout='horizontal'>
      <Form.Item
        name='reason'
        label={$t({ defaultMessage: 'Type the reason to revoke' })}
      >
        <Input onChange={(e) => {
          modal.update({
            okButtonProps: { disabled: !e.target.value }
          })
        }} />
      </Form.Item>
    </Form>
  )
}
