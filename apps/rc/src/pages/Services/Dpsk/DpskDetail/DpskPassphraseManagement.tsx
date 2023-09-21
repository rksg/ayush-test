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
import { Features, useIsSplitOn, useIsTierAllowed }                                                      from '@acx-ui/feature-toggle'
import { CsvSize, ImportFileDrawer, PassphraseViewer, ImportFileDrawerType, useDpskNewConfigFlowParams } from '@acx-ui/rc/components'
import {
  doProfileDelete,
  useDeleteDpskPassphraseListMutation,
  useLazyDownloadNewFlowPassphrasesQuery,
  useDownloadPassphrasesMutation,
  useGetEnhancedDpskPassphraseListQuery,
  useRevokeDpskPassphraseListMutation,
  useUploadPassphrasesMutation,
  getDisabledActionMessage,
  showAppliedInstanceMessage
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
import { getIntl, validationMessages }         from '@acx-ui/utils'

import NetworkForm                    from '../../../Networks/wireless/NetworkForm/NetworkForm'
import { MAX_PASSPHRASES_PER_TENANT } from '../constants'

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
  const isNewConfigFlow = useIsSplitOn(Features.DPSK_NEW_CONFIG_FLOW_TOGGLE)
  const dpskNewConfigFlowParams = useDpskNewConfigFlowParams()
  const [ deletePassphrases ] = useDeleteDpskPassphraseListMutation()
  const [ uploadCsv, uploadCsvResult ] = useUploadPassphrasesMutation()
  const [ downloadCsv ] = useDownloadPassphrasesMutation()
  const [ downloadNewFlowCsv ] = useLazyDownloadNewFlowPassphrasesQuery()
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
    enableSelectAllPagesData: ['id'],
    apiParams: dpskNewConfigFlowParams
  })

  const downloadPassphrases = async () => {
    const apiParams = { ...params, ...dpskNewConfigFlowParams }

    try {
      if (isNewConfigFlow) {
        const payload = {
          page: 1,
          pageSize: MAX_PASSPHRASES_PER_TENANT,
          ...tableQuery.search
        }
        downloadNewFlowCsv({ params: apiParams, payload }).unwrap()
      } else {
        downloadCsv({ params: apiParams }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const macColumn = isNewConfigFlow ? [] : [
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: true
    }
  ]

  const columns: TableProps<NewDpskPassphrase>['columns'] = [
    {
      key: 'createdDate',
      title: $t({ defaultMessage: 'Passphrase Created' }),
      dataIndex: 'createdDate',
      sorter: true,
      defaultSortOrder: 'descend',
      fixed: 'left',
      render: function (_, { createdDate }) {
        return moment(createdDate).format(EXPIRATION_TIME_FORMAT)
      }
    },
    {
      key: 'username',
      title: $t({ defaultMessage: 'User Name' }),
      dataIndex: 'username',
      sorter: true,
      searchable: true
    },
    {
      key: 'numberOfDevices',
      title: $t({ defaultMessage: 'No. of Devices' }),
      dataIndex: 'numberOfDevices',
      sorter: true,
      render: function (_, { numberOfDevices }) {
        return (numberOfDevices && numberOfDevices !== -1)
          ? numberOfDevices
          : $t(unlimitedNumberOfDeviceLabel)
      }
    },
    ...macColumn,
    {
      key: 'passphrase',
      title: $t({ defaultMessage: 'Passphrase' }),
      dataIndex: 'passphrase',
      sorter: false,
      render: function (_, { passphrase }) {
        return <PassphraseViewer passphrase={passphrase}/>
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
      render: function (_, row) {
        return getPassphraseStatus(row, isCloudpathEnabled)
      }
    },
    {
      key: 'expirationDate',
      title: $t({ defaultMessage: 'Expires' }),
      dataIndex: 'expirationDate',
      sorter: true,
      render: function (_, { expirationDate }) {
        if (expirationDate) {
          return transformAdvancedDpskExpirationText(intl, {
            expirationType: ExpirationType.SPECIFIED_DATE,
            expirationDate: expirationDate,
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
      [{ fieldName: 'identityId', fieldText: intl.$t({ defaultMessage: 'Identity' }) }],
      async () => deletePassphrases({
        params: { ...params, ...dpskNewConfigFlowParams },
        payload: selectedRows.map(p => p.id)
      }).then(callback)
    )
  }

  // eslint-disable-next-line max-len
  const canRevoke = (type: 'revoke' | 'unrevoke', selectedRows: NewDpskPassphrase[], callback: () => void) => {
    const disabledActionMessage = getDisabledActionMessage(
      selectedRows,
      [{ fieldName: 'identityId', fieldText: intl.$t({ defaultMessage: 'Identity' }) }],
      // eslint-disable-next-line max-len
      type === 'revoke' ? intl.$t({ defaultMessage: 'Revoke' }) : intl.$t({ defaultMessage: 'Unrevoke' })
    )

    if (disabledActionMessage) {
      showAppliedInstanceMessage(disabledActionMessage)
    } else {
      callback()
    }
  }

  const canEdit = (selectedRows: NewDpskPassphrase[]): boolean => {
    return isCloudpathEnabled && selectedRows.length === 1 && !selectedRows[0].identityId
  }

  const allowManageDevices = (selectedRows: NewDpskPassphrase[]) => {
    if (isNewConfigFlow) {
      return !(!isCloudpathEnabled || selectedRows.length !== 1)
    }

    if (!isCloudpathEnabled || selectedRows.length !== 1) return false

    const row = selectedRows[0]
    if (row && row.hasOwnProperty('numberOfDevices')) return row.numberOfDevices! > 1

    return false
  }

  const rowActions: TableProps<NewDpskPassphrase>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit Passphrase' }),
      visible: canEdit,
      onClick: ([selectedRow]) => {
        setPassphrasesDrawerEditMode({ isEdit: true, passphraseId: selectedRow.id })
        setAddPassphrasesDrawerVisible(true)
        setManageDevicesVisible(false)
      }
    },
    {
      label: $t({ defaultMessage: 'Manage Devices' }),
      visible: (selectedRows: NewDpskPassphrase[]) => allowManageDevices(selectedRows),
      onClick: ([selectedRow]) => {
        setManagePassphraseInfo(selectedRow)
        setManageDevicesVisible(true)
        setAddPassphrasesDrawerVisible(false)
      }
    },
    {
      label: $t({ defaultMessage: 'Revoke' }),
      visible: isCloudpathEnabled,
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        canRevoke('revoke', selectedRows, () => {
          showRevokeModal(
            selectedRows.length,
            selectedRows[0].username ?? '',
            async (revocationReason: string) => {
              await revokePassphrases({
                params: { ...params, ...dpskNewConfigFlowParams },
                payload: {
                  ids: selectedRows.map(p => p.id),
                  changes: { revocationReason }
                }
              })
              clearSelection()
            }
          )
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Unrevoke' }),
      visible: isCloudpathEnabled,
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        canRevoke('unrevoke', selectedRows, () => {
          revokePassphrases({
            params: { ...params, ...dpskNewConfigFlowParams },
            payload: {
              ids: selectedRows.map(p => p.id),
              changes: { revocationReason: null }
            }
          }).then(clearSelection)
        })
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
          await uploadCsv({
            params: { ...params, ...dpskNewConfigFlowParams },
            payload: formData
          }).unwrap()
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
function showRevokeModal (passphraseCount: number, entityValue: string, onFinish: (revocationReason: string) => Promise<void>) {
  const modal = AntModal.confirm({})
  const { $t } = getIntl()

  const getRevokeTitle = () => {
    return $t({
      defaultMessage: `Revoke "{count, plural,
        one {{entityValue}}
        other {{count} {formattedEntityName}}
      }"?`
    }, {
      count: passphraseCount,
      entityValue: entityValue,
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
  const [ okButtonDisabled, setOkButtonDisabled ] = useState(true)

  modal.update({
    onOk: async () => {
      await onFinish(form.getFieldValue('reason'))
    },
    okButtonProps: { disabled: okButtonDisabled }
  })

  const onFieldsChange = () => {
    setOkButtonDisabled(form.getFieldsError().some(item => item.errors.length > 0))
  }

  return (
    <Form form={form} layout='horizontal' onFieldsChange={onFieldsChange}>
      <Form.Item
        name='reason'
        label={$t({ defaultMessage: 'Type the reason to revoke' })}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Reason is required' }) },
          { max: 255, message: $t(validationMessages.maxStr) }
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
}
