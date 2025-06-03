import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, PasswordInput, SummaryCard } from '@acx-ui/components'
import { Features, useIsSplitOn }                                           from '@acx-ui/feature-toggle'
import { useGetDirectoryServerByIdQuery }                                   from '@acx-ui/rc/services'
import {
  DirectoryServer,
  DirectoryServerProfileEnum,
  filterByAccessForServicePolicyMutation,
  getPolicyAllowedOperation,
  getPolicyDetailsLink,
  usePolicyListBreadcrumb,
  getScopeKeyByPolicy,
  PolicyOperation,
  PolicyType,
  AttributeMapping,
  IdentityAttributeMappingNameType,
  transformDisplayText
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { noDataDisplay }         from '@acx-ui/utils'

import { DirectoryServerInstancesTable } from './DirectoryServerInstancesTable'


export default function DirectoryServerDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const { data } = useGetDirectoryServerByIdQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.DIRECTORY_SERVER)}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink to={getPolicyDetailsLink({
            type: PolicyType.DIRECTORY_SERVER,
            oper: PolicyOperation.EDIT,
            policyId: params.policyId as string
          })}
          rbacOpsIds={getPolicyAllowedOperation(PolicyType.DIRECTORY_SERVER, PolicyOperation.EDIT)}
          scopeKey={getScopeKeyByPolicy(PolicyType.DIRECTORY_SERVER, PolicyOperation.EDIT)}>
            <Button key='configure' type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          {data && <DirectoryServerOverview data={data} />}
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <DirectoryServerInstancesTable />
        </GridCol>
      </GridRow>
    </>
  )
}

interface DirectoryServerOverviewProps {
  data: DirectoryServer
}

function DirectoryServerOverview (props: DirectoryServerOverviewProps) {
  const { data } = props
  const { $t } = useIntl()

  // eslint-disable-next-line max-len
  const isSupportIdentityAttribute = useIsSplitOn(Features.WIFI_DIRECTORY_PROFILE_REUSE_COMPONENT_TOGGLE)

  const directoryServerInfo = [
    {
      title: $t({ defaultMessage: 'Service Type' }),
      content: data?.type === DirectoryServerProfileEnum.LDAP ? 'LDAP' :
        data?.type === DirectoryServerProfileEnum.AD ? 'Active Directory' :
          data?.type || noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'TLS Encryption' }),
      content: data?.tlsEnabled ? 'On' : 'Off'
    },
    {
      title: $t({ defaultMessage: 'Server Address' }),
      content: data?.host && data?.port ? `${data.host}:${data.port}` : noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'Admin Domain Name' }),
      content: data?.adminDomainName
    },
    {
      title: $t({ defaultMessage: 'Admin Password' }),
      content: (
        <PasswordInput
          readOnly
          bordered={false}
          value={data?.adminPassword}
        />
      )
    }, {
      // This is for the layout
      title: ''
    }, {
      title: $t({ defaultMessage: 'Identity Name' }),
      visible: isSupportIdentityAttribute,
      content: () => {
        return (
          transformDisplayText(
            data?.attributeMappings?.find(
              (mapping: AttributeMapping) =>
                mapping.name === IdentityAttributeMappingNameType.DISPLAY_NAME
            )?.mappedByName)
        )
      }
    }, {
      title: $t({ defaultMessage: 'Identity Email' }),
      visible: isSupportIdentityAttribute,
      content: () => {
        return (
          transformDisplayText(
            data?.attributeMappings?.find(
              (mapping: AttributeMapping) =>
                mapping.name === IdentityAttributeMappingNameType.EMAIL
            )?.mappedByName)
        )
      }
    }, {
      title: $t({ defaultMessage: 'Identity Phone' }),
      visible: isSupportIdentityAttribute,
      content: () => {
        return (
          transformDisplayText(
            data?.attributeMappings?.find(
              (mapping: AttributeMapping) =>
                mapping.name === IdentityAttributeMappingNameType.PHONE_NUMBER
            )?.mappedByName)
        )
      }
    }
  ]

  return <SummaryCard data={directoryServerInfo} colPerRow={6} />
}
