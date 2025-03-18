/* eslint-disable align-import/align-import */
import { useMemo, useState } from 'react'

import { Modal as AntModal, Form, Input } from 'antd'
import moment                             from 'moment'
import { RawIntlProvider, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Loader,
  Modal,
  ModalRef,
  ModalType,
  Table,
  TableColumn,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                       from '@acx-ui/feature-toggle'
import {
  doProfileDelete,
  useDeleteDpskPassphraseListMutation,
  useLazyDownloadNewFlowPassphrasesQuery,
  useRevokeDpskPassphraseListMutation,
  useUploadPassphrasesMutation,
  getDisabledActionMessage,
  showAppliedInstanceMessage,
  useSearchPersonaListQuery
} from '@acx-ui/rc/services'
import {
  DpskUrls,
  EXPIRATION_TIME_FORMAT,
  ExpirationType,
  MAX_PASSPHRASES_PER_TENANT,
  NetworkTypeEnum,
  NewDpskPassphrase,
  ServiceOperation,
  ServiceType,
  filterDpskOperationsByPermission,
  getPassphraseStatus,
  getScopeKeyByService,
  transformAdvancedDpskExpirationText,
  unlimitedNumberOfDeviceLabel,
  IdentityDetailsLink, TableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload, RolesEnum, WifiScopes } from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasCrossVenuesPermission, hasPermission, hasRoles } from '@acx-ui/user'
import { getIntl, getOpsApi, validationMessages }                                   from '@acx-ui/utils'


import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../ImportFileDrawer'
import { NetworkForm } from '../../NetworkForm'
import { PassphraseViewer } from '../../PassphraseViewer'

import DpskPassphraseDrawer, { DpskPassphraseEditMode } from './DpskPassphraseDrawer'
import ManageDevicesDrawer from './ManageDevicesDrawer'



interface UploadPassphrasesFormFields {
  usernamePrefix: string
}

interface DpskPassphraseManagementProps {
  serviceId: string,
  tableQuery: TableQuery<NewDpskPassphrase, RequestPayload<unknown>, unknown>,
  disabledFeatures?: {
    searchable?: boolean
    import?: boolean
    export?: boolean
    create?: boolean
    addNetwork?: boolean
  }
}

export function DpskPassphraseManagement (props: DpskPassphraseManagementProps) {
  const { serviceId, tableQuery, disabledFeatures } = props
  const intl = useIntl()
  const { $t } = intl
  const { personaId } = useParams()
  const inIdentityPage = useMemo(() => personaId !== undefined, [personaId])
  const [ addPassphrasesDrawerVisible, setAddPassphrasesDrawerVisible ] = useState(false)
  const [ manageDevicesVisible, setManageDevicesVisible ] = useState(false)
  const [ managePassphraseInfo, setManagePassphraseInfo ] = useState({} as NewDpskPassphrase)
  const [
    passphrasesDrawerEditMode,
    setPassphrasesDrawerEditMode
  ] = useState<DpskPassphraseEditMode>({ isEdit: false })
  const [ deletePassphrases ] = useDeleteDpskPassphraseListMutation()
  const [ uploadCsv, uploadCsvResult ] = useUploadPassphrasesMutation()
  const [ downloadNewFlowCsv ] = useLazyDownloadNewFlowPassphrasesQuery()
  const [ revokePassphrases ] = useRevokeDpskPassphraseListMutation()
  const [ uploadCsvDrawerVisible, setUploadCsvDrawerVisible ] = useState(false)
  const [ networkModalVisible, setNetworkModalVisible ] = useState(false)
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isIdentityGroupRequired = useIsSplitOn(Features.DPSK_REQUIRE_IDENTITY_GROUP)
  const isDpskRole = hasRoles(RolesEnum.DPSK_ADMIN)

  const { data: identityList } = useSearchPersonaListQuery(
    { payload: { pageSize: 1000,
      ids: [...new Set(tableQuery.data?.data?.map(d => d.identityId))] } },
    { skip: !tableQuery.data || !isIdentityGroupRequired })

  const downloadPassphrases = async () => {
    try {
      const payload = {
        page: 1,
        pageSize: MAX_PASSPHRASES_PER_TENANT,
        ...tableQuery.search
      }
      downloadNewFlowCsv({ params: { serviceId }, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

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
      searchable: !disabledFeatures?.searchable
    },
    ...inIdentityPage ? []
      : isIdentityGroupRequired ? [{
        key: 'identityId',
        title: $t({ defaultMessage: 'Identity' }),
        dataIndex: 'identityId',
        sorter: true,
        render: function (_, row) {
          const item = identityList?.data?.filter(data => data.id===row.identityId)[0]
          return (item ? <IdentityDetailsLink
            disableLink={isDpskRole}
            name={item.name}
            personaId={item.id}
            personaGroupId={item.groupId}
            revoked={item.revoked}
          /> : '')
        }
      } as TableColumn<NewDpskPassphrase>] : [],
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
      key: 'devices',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'devices',
      searchable: !disabledFeatures?.searchable,
      render: function (_, { devices }) {
        return devices?.map(device => device.mac).join(', ')
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
      // eslint-disable-next-line max-len
      isIdentityGroupRequired ? [] : [{ fieldName: 'identityId', fieldText: intl.$t({ defaultMessage: 'Identity' }) }],
      async () => deletePassphrases({
        params: { serviceId },
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

    // Allow to revoke/unrevoke after we make identity group required
    if (disabledActionMessage && !isIdentityGroupRequired) {
      showAppliedInstanceMessage(disabledActionMessage)
    } else {
      callback()
    }
  }

  const canEdit = (selectedRows: NewDpskPassphrase[]): boolean => {
    // Allow to edit after we make identity group required
    return isCloudpathEnabled && selectedRows.length === 1 &&
      (!selectedRows[0].identityId || isIdentityGroupRequired)
  }

  const allowManageDevices = (selectedRows: NewDpskPassphrase[]) => {
    return isCloudpathEnabled && selectedRows.length === 1
  }

  const hasAddNetworkPermission = () => {
    if (disabledFeatures?.addNetwork) {
      return false
    }
    if (getUserProfile().rbacOpsApiEnabled) {
      return hasAllowedOperations(['POST:/wifiNetworks'])
    }
    return hasCrossVenuesPermission() && hasPermission({ scopes: [WifiScopes.CREATE] })
  }

  const rowActions: TableProps<NewDpskPassphrase>['rowActions'] = [
    {
      rbacOpsIds: [getOpsApi(DpskUrls.updatePassphrase)],
      scopeKey: getScopeKeyByService(ServiceType.DPSK, ServiceOperation.EDIT),
      label: $t({ defaultMessage: 'Edit Passphrase' }),
      visible: canEdit,
      onClick: ([selectedRow]) => {
        setPassphrasesDrawerEditMode({ isEdit: true, passphraseId: selectedRow.id })
        setAddPassphrasesDrawerVisible(true)
        setManageDevicesVisible(false)
      }
    },
    {
      scopeKey: getScopeKeyByService(ServiceType.DPSK, ServiceOperation.EDIT),
      label: $t({ defaultMessage: 'Manage Devices' }),
      visible: (selectedRows: NewDpskPassphrase[]) => allowManageDevices(selectedRows),
      onClick: ([selectedRow]) => {
        setManagePassphraseInfo(selectedRow)
        setManageDevicesVisible(true)
        setAddPassphrasesDrawerVisible(false)
      }
    },
    {
      rbacOpsIds: [getOpsApi(DpskUrls.revokePassphrases)],
      scopeKey: getScopeKeyByService(ServiceType.DPSK, ServiceOperation.EDIT),
      label: $t({ defaultMessage: 'Revoke' }),
      visible: isCloudpathEnabled,
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        canRevoke('revoke', selectedRows, () => {
          showRevokeModal(
            selectedRows.length,
            selectedRows[0].username ?? '',
            async (revocationReason: string) => {
              await revokePassphrases({
                params: { serviceId },
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
      rbacOpsIds: [getOpsApi(DpskUrls.revokePassphrases)],
      scopeKey: getScopeKeyByService(ServiceType.DPSK, ServiceOperation.EDIT),
      label: $t({ defaultMessage: 'Unrevoke' }),
      visible: isCloudpathEnabled,
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        canRevoke('unrevoke', selectedRows, () => {
          revokePassphrases({
            params: { serviceId },
            payload: {
              ids: selectedRows.map(p => p.id),
              changes: { revocationReason: null }
            }
          }).then(clearSelection)
        })
      }
    },
    {
      rbacOpsIds: [getOpsApi(DpskUrls.deletePassphrase)],
      scopeKey: getScopeKeyByService(ServiceType.DPSK, ServiceOperation.EDIT),
      label: $t({ defaultMessage: 'Delete' }),
      disabled: ([selectedRow]) => !isIdentityGroupRequired && !!selectedRow?.identityId,
      tooltip: (selectedRow) => getDisabledActionMessage(
        selectedRow,
        // eslint-disable-next-line max-len
        isIdentityGroupRequired ? [] : [{ fieldName: 'identityId', fieldText: $t({ defaultMessage: 'Identity' }) }],
        $t({ defaultMessage: 'delete' })),
      onClick: (selectedRows: NewDpskPassphrase[], clearSelection) => {
        doDelete(selectedRows, clearSelection)
      }
    }
  ]

  const allowedRowActions = filterDpskOperationsByPermission(rowActions)

  const actions = [
    ...(filterDpskOperationsByPermission([
      ...(disabledFeatures?.create
        ? []
        : [{
          rbacOpsIds: [getOpsApi(DpskUrls.addPassphrase)],
          label: $t({ defaultMessage: 'Add Passphrases' }),
          onClick: () => {
            setPassphrasesDrawerEditMode({ isEdit: false })
            setAddPassphrasesDrawerVisible(true)
          }
        }]),
      ...(disabledFeatures?.import
        ? []
        : [{
          rbacOpsIds: [getOpsApi(DpskUrls.uploadPassphrases)],
          label: $t({ defaultMessage: 'Import From File' }),
          onClick: () => setUploadCsvDrawerVisible(true)
        }])
    ])),
    ...(disabledFeatures?.export
      ? []
      : [{
        label: $t({ defaultMessage: 'Export To File' }),
        onClick: () => downloadPassphrases()
      }]),
    ...(hasAddNetworkPermission() ? [{
      label: $t({ defaultMessage: 'Add DPSK Network' }),
      onClick: () => setNetworkModalVisible(true)
    }]: [])
  ]

  return (<>
    {addPassphrasesDrawerVisible && <DpskPassphraseDrawer
      visible={true}
      serviceId={serviceId}
      setVisible={setAddPassphrasesDrawerVisible}
      editMode={passphrasesDrawerEditMode}
    />}
    { Object.keys(managePassphraseInfo).length > 0 && <ManageDevicesDrawer
      visible={manageDevicesVisible}
      serviceId={serviceId}
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
            params: { serviceId },
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
        settingsId={tableQuery.pagination.settingsId ?? 'Default-DPSK-Passphrase-Table'}
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        getAllPagesData={tableQuery.getAllPagesData}
        onChange={tableQuery.handleTableChange}
        actions={actions}
        rowActions={allowedRowActions}
        rowSelection={allowedRowActions.length > 0 && { type: 'checkbox' }}
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
