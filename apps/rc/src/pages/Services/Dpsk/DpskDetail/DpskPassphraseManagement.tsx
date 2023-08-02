import { useState } from 'react'

import { Modal as AntModal, Form, Input } from 'antd'
import moment                             from 'moment'
import { RawIntlProvider, useIntl }       from 'react-intl'

import {
  Loader,
  Modal,
  ModalRef,
  ModalType,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsTierAllowed }                                        from '@acx-ui/feature-toggle'
import { CsvSize, ImportFileDrawer, PassphraseViewer, ImportFileDrawerType } from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteDpskPassphraseListMutation,
  useDownloadPassphrasesMutation,
  useGetEnhancedDpskPassphraseListQuery,
  useRevokeDpskPassphraseListMutation,
  useUploadPassphrasesMutation
} from '@acx-ui/rc/services'
import {
  EXPIRATION_TIME_FORMAT,
  ExpirationType,
  NetworkTypeEnum,
  NewDpskPassphrase,
  getPassphraseStatus,
  transformAdvancedDpskExpirationText,
  unlimitedNumberOfDeviceLabel,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams }                           from '@acx-ui/react-router-dom'
import { RolesEnum }                           from '@acx-ui/types'
import { filterByAccess, hasAccess, hasRoles } from '@acx-ui/user'
import { getIntl }                             from '@acx-ui/utils'

import NetworkForm from '../../../Networks/wireless/NetworkForm/NetworkForm'

import DpskPassphraseDrawer, { DpskPassphraseEditMode } from './DpskPassphraseDrawer'
import ManageDevicesDrawer                              from './ManageDevicesDrawer'



interface UploadPassphrasesFormFields {
  usernamePrefix: string
}

const defaultPayload = {
  filters: {}
}

const defaultSearch = {
  searchTargetFields: ['username'],
  searchString: ''
}

const defaultSorter = {
  sortField: 'createdDate',
  sortOrder: 'DESC'
}

export default function DpskPassphraseManagement () {
  const intl = useIntl()
  const { $t } = intl
  const [ addPassphrasesDrawerVisible, setAddPassphrasesDrawerVisible ] = useState(false)
  const [ manageDevicesVisible, setManageDevicesVisible ] = useState(false)
  const [ managePassphraseInfo, setManagePassphraseInfo ] = useState({} as NewDpskPassphrase)
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
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  const tableQuery = useTableQuery({
    useQuery: useGetEnhancedDpskPassphraseListQuery,
    sorter: defaultSorter,
    defaultPayload,
    search: defaultSearch,
    enableSelectAllPagesData: ['id']
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
        return moment(data as string).format(EXPIRATION_TIME_FORMAT)
      }
    },
    {
      key: 'username',
      title: $t({ defaultMessage: 'User Name' }),
      dataIndex: 'username',
      sorter: true,
      ellipsis: true,
      searchable: true
    },
    {
      key: 'numberOfDevices',
      title: $t({ defaultMessage: 'No. of Devices' }),
      dataIndex: 'numberOfDevices',
      sorter: true,
      render: function (data) {
        return (data && data !== -1) ? data : $t(unlimitedNumberOfDeviceLabel)
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
        return <PassphraseViewer passphrase={data as string}/>
      }
    },
    {
      key: 'vlanId',
      title: $t({ defaultMessage: 'VLAN' }),
      dataIndex: 'vlanId',
      sorter: true
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'expirationDate',
      sorter: false,
      render: function (data, row) {
        return getPassphraseStatus(row, isCloudpathEnabled)
      }
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
            expirationDate: data as string,
            displayTime: true
          })
        }
        return transformAdvancedDpskExpirationText(intl, { expirationType: null })
      }
    },
    ...(isCloudpathEnabled
      ? [{
        key: 'revocationReason',
        title: $t({ defaultMessage: 'Revocation Reason' }),
        dataIndex: 'revocationReason',
        sorter: true
      },
      {
        key: 'email',
        title: $t({ defaultMessage: 'Contact Email Address' }),
        dataIndex: 'email',
        sorter: true
      },
      {
        key: 'phoneNumber',
        title: $t({ defaultMessage: 'Contact Phone Number' }),
        dataIndex: 'phoneNumber',
        sorter: true
      }]
      : [])
  ]

  const doDelete = (selectedRows: NewDpskPassphrase[], callback: () => void) => {
    doProfileDelete(
      selectedRows,
      $t({ defaultMessage: 'Passphrase' }),
      selectedRows[0].username,
      [{ fieldName: 'identityId', fieldText: intl.$t({ defaultMessage: 'Persona' }) }],
      async () => deletePassphrases({ params, payload: selectedRows.map(p => p.id) }).then(callback)
    )
  }

  const canEdit = (selectedRows: NewDpskPassphrase[]): boolean => {
    return isCloudpathEnabled && selectedRows.length === 1 && !selectedRows[0].identityId
  }

  const rowActions: TableProps<NewDpskPassphrase>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit Passphrase' }),
      visible: canEdit,
      onClick: ([selectedRow]) => {
        setPassphrasesDrawerEditMode({ isEdit: true, passphraseId: selectedRow.id })
        setAddPassphrasesDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Manage Devices' }),
      // eslint-disable-next-line max-len
      visible: (selectedRows: NewDpskPassphrase[]) => isCloudpathEnabled && selectedRows.length === 1,
      onClick: ([selectedRow]) => {
        setManagePassphraseInfo(selectedRow)
        setManageDevicesVisible(true)
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
              changes: { revocationReason }
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
            changes: { revocationReason: null }
          }
        }).then(clearSelection)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
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
    ...!hasRoles(RolesEnum.DPSK_ADMIN) ? [{
      label: $t({ defaultMessage: 'Add DPSK Network' }),
      onClick: () => setNetworkModalVisible(true)
    }]: []
  ]

  return (<>
    {addPassphrasesDrawerVisible && <DpskPassphraseDrawer
      visible={true}
      setVisible={setAddPassphrasesDrawerVisible}
      editMode={passphrasesDrawerEditMode}
    />}
    { Object.keys(managePassphraseInfo).length > 0 && <ManageDevicesDrawer
      visible={manageDevicesVisible}
      setVisible={setManageDevicesVisible}
      passphraseInfo={managePassphraseInfo}
      setPassphraseInfo={setManagePassphraseInfo}
    />}
    {uploadCsvDrawerVisible && <ImportFileDrawer type={ImportFileDrawerType.DPSK}
      title={$t({ defaultMessage: 'Import from file' })}
      maxSize={CsvSize['20MB']}
      maxEntries={5000}
      acceptType={['csv']}
      templateLink='assets/templates/DPSK_import_template_expiration.csv'
      visible={true}
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
    </ImportFileDrawer>}
    <Modal
      title={$t({ defaultMessage: 'Add DPSK Network' })}
      type={ModalType.ModalStepsForm}
      visible={networkModalVisible}
      mask={true}
      children={
        <NetworkForm modalMode={true}
          modalCallBack={()=>{
            setNetworkModalVisible(false)
          }}
          createType={NetworkTypeEnum.DPSK}
        />
      }
      destroyOnClose={true}
    />
    <Loader states={[tableQuery]}>
      <Table<NewDpskPassphrase>
        settingsId='dpsk-passphrase-table'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        getAllPagesData={tableQuery.getAllPagesData}
        onChange={tableQuery.handleTableChange}
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox' }}
        rowKey='id'
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
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
