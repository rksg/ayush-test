import { useState } from 'react'

import { Input }     from 'antd'
import moment        from 'moment'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PasswordInput, Table, TableProps, showActionModal }                                                                                                    from '@acx-ui/components'
import { useDeleteSpecificTemplateScepKeyMutation, useGetSpecificTemplateScepKeysQuery }                                                                                from '@acx-ui/rc/services'
import { CertificateUrls, ChallengePasswordType, PolicyOperation, PolicyType, ScepKeyData, filterByAccessForServicePolicyMutation, getScopeKeyByPolicy, useTableQuery } from '@acx-ui/rc/utils'
import { getOpsApi }                                                                                                                                                    from '@acx-ui/utils'

import ScepDrawer from './ScepDrawer'

export default function ScepTable ({ templateId = '' }) {
  const { $t } = useIntl()
  const settingsId = 'scepTable'
  const params = useParams()
  const tableQuery = useTableQuery({
    useQuery: useGetSpecificTemplateScepKeysQuery,
    defaultPayload: { page: 0, pageSize: 10 },
    apiParams: { templateId },
    pagination: { settingsId }
  })
  const [ visible, setVisible ] = useState(false)
  const [ selectedScep, setSelectedScep ] = useState<ScepKeyData>()
  const [ deleteScepKey ] = useDeleteSpecificTemplateScepKeyMutation()

  const columns: TableProps<ScepKeyData>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      filterMultiple: false,
      dataIndex: 'status',
      key: 'status',
      render: (_, row) => {
        return moment(row.expirationDate).isBefore(moment()) ?
          $t({ defaultMessage: 'Expired' }): $t({ defaultMessage: 'Enabled' })
      }
    },
    {
      title: $t({ defaultMessage: 'Access' }),
      dataIndex: 'access',
      key: 'access',
      render: (_, row) => {
        return row.blockedSubnets ? $t({ defaultMessage: 'Restricted' }) : '*'
      }
    },
    {
      title: $t({ defaultMessage: 'SCEP Enroll URL' }),
      dataIndex: 'enrollmentUrl',
      key: 'enrollmentUrl',
      copyable: true,
      ellipsis: true
    },
    {
      title: $t({ defaultMessage: 'Challenge Password' }),
      dataIndex: 'challengePassword',
      key: 'challengePassword',
      sorter: true,
      render: (_, row) => {
        return <div>
          {row.challengePasswordType === ChallengePasswordType.STATIC &&
          <PasswordInput
            readOnly
            bordered={false}
            value={row.challengePassword}
          />}
          {row.challengePasswordType === ChallengePasswordType.NONE &&
            <Input readOnly
              value={$t({ defaultMessage: 'None' })}
              style={{ border: 'none', background: 'none' }}/>
          }
          {row.challengePasswordType === ChallengePasswordType.MICROSOFT &&
            <Input readOnly
              value={$t({ defaultMessage: 'Microsoft Intune Verification' })}
              style={{ border: 'none', background: 'none' }}/>
          }
        </div>
      }
    }
  ]

  const rowActions: TableProps<ScepKeyData>['rowActions'] = [
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.EDIT),
      label: $t({ defaultMessage: 'Edit' }),
      rbacOpsIds: [getOpsApi(CertificateUrls.editCertificateTemplateScepKeys)],
      onClick: ([selectedRow]) => {
        setVisible(true)
        setSelectedScep(selectedRow)
      }
    },
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.DELETE),
      rbacOpsIds: [getOpsApi(CertificateUrls.deleteCertificateTemplateScepKeys)],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([selectedRow], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'SCEP Key' }),
            entityValue: selectedRow.name,
            numOfEntities: 1
          },
          onOk: () => {
            deleteScepKey({
              params: { policyId: params.policyId, scepKeysId: selectedRow.id }
            }).then(() => {
              clearSelection()
              setVisible(false)
            })
          }
        })
      }
    }
  ]
  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  const actionButtons = filterByAccessForServicePolicyMutation([
    {
      scopeKey: getScopeKeyByPolicy(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.CREATE),
      rbacOpsIds: [getOpsApi(CertificateUrls.createCertificateTemplateScepKeys)],
      label: $t({ defaultMessage: 'Add SCEP Key' }),
      onClick: () => setVisible(true)
    }
  ])

  return (
    <Loader states={[tableQuery]}>
      <Table<ScepKeyData>
        settingsId={settingsId}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={allowedRowActions}
        actions={actionButtons}
        rowSelection={
          allowedRowActions.length > 0 && { type: 'radio', onChange: () => {
            setVisible(false)
          } }}
        rowKey='id'
        enableApiFilter={true}
      />
      <ScepDrawer
        visible={visible}
        onClose={()=>{
          setVisible(false)
          setSelectedScep(undefined)
        }}
        scepData={selectedScep}
      />
    </Loader>
  )
}
