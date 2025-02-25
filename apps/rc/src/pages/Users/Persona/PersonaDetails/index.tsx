import { createContext, useEffect, useState } from 'react'

import { Tag }       from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, cssStr, Loader, PageHeader, showActionModal, Tabs } from '@acx-ui/components'
import { Features, useIsSplitOn }                                    from '@acx-ui/feature-toggle'
import { PersonaDrawer }                                             from '@acx-ui/rc/components'
import {
  useGetPersonaByIdQuery,
  useUpdatePersonaMutation,
  useGetPersonaGroupByIdQuery,
  useGetCertificatesByIdentityIdQuery,
  useGetEnhancedDpskPassphraseListQuery,
  useSearchMacRegistrationsQuery
} from '@acx-ui/rc/services'
import {
  MacRegistration,
  PersonaUrls,
  TableQuery,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                   from '@acx-ui/react-router-dom'
import { RequestPayload }                               from '@acx-ui/types'
import { filterByOperations, hasCrossVenuesPermission } from '@acx-ui/user'
import { getOpsApi }                                    from '@acx-ui/utils'

import { blockedTagStyle, PersonaBlockedIcon } from '../styledComponents'

import CertificateTab       from './CertificateTab'
import DpskPassphraseTab    from './DpskPassphraseTab'
import IdentityClientTable  from './IdentityClientTable'
import LegacyPersonaDetails from './LegacyPersonaDetails'
import MacAddressTab        from './MacAddressTab'
import PersonaOverview      from './PersonaOverview'

export const IdentityDetailsContext = createContext({} as {
  setDeviceCount: (count: number) => void,
  setCertCount: (count: number) => void,
  setDpskCount: (count: number) => void,
  setMacAddressCount: (count: number) => void
})

enum IdentityTabKey {
  OVERVIEW = 'overview',
  DEVICE = 'devices',
  CERTIFICATE = 'certificates',
  DPSK = 'passphrases',
  MAC = 'macAddresses'
}

const dpskDefaultSorter = {
  sortField: 'createdDate',
  sortOrder: 'DESC'
}

const macRegDefaultSorter = {
  sortField: 'macAddress',
  sortOrder: 'ASC'
}

function PersonaDetails () {
  const { $t } = useIntl()
  const { personaId, personaGroupId, activeTab } = useParams()
  const navigate = useNavigate()
  const isCertTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isIdentityRefactorEnabled = true

  const [editDrawerVisible, setEditDrawerVisible] = useState(false)

  const { data: personaData, isLoading: isPersonaLoading } = useGetPersonaByIdQuery({
    params: { groupId: personaGroupId, id: personaId }
  }, { skip: !personaId })
  const { data: personaGroupData, isLoading: isPersonaGroupLoading } = useGetPersonaGroupByIdQuery({
    params: { groupId: personaGroupId }
  }, { skip: !personaGroupId })

  const title = personaData?.name ?? personaId
  const revokedStatus = personaData?.revoked ?? false

  const certTableQuery = useTableQuery({
    useQuery: useGetCertificatesByIdentityIdQuery,
    apiParams: {
      templateId: personaGroupData?.certificateTemplateId!,
      personaId: personaId!
    },
    defaultPayload: {},
    option:
      { skip: !isCertTemplateEnabled || !personaGroupData?.certificateTemplateId || !personaId }
  })

  const dpskTableQuery = useTableQuery({
    useQuery: useGetEnhancedDpskPassphraseListQuery,
    defaultPayload: {},
    search: {
      searchTargetFields: ['id'],
      searchString: personaData?.dpskGuid ?? '--'
    },
    sorter: dpskDefaultSorter,
    enableSelectAllPagesData: ['id'],
    pagination: { settingsId: 'identity-dpskpasshphrase-table' },
    apiParams: { serviceId: personaGroupData?.dpskPoolId ?? '' },
    option: {
      skip: !personaGroupData?.dpskPoolId || !personaData?.dpskGuid
    }
  })
  const macRegistrationTableQuery = useTableQuery({
    useQuery: useSearchMacRegistrationsQuery,
    sorter: macRegDefaultSorter,
    defaultPayload: {
      dataOption: 'all',
      searchCriteriaList: [
        {
          filterKey: 'identityId',
          operation: 'eq',
          value: personaId ?? '--'
        }
      ]
    },
    pagination: { settingsId: 'identity-macregistration-table' },
    apiParams: { policyId: personaGroupData?.macRegistrationPoolId ?? '' },
    option: {
      skip: !personaGroupData?.macRegistrationPoolId || !personaId
    }
  }) as unknown as TableQuery<MacRegistration, RequestPayload, unknown>

  const [ updatePersona ] = useUpdatePersonaMutation()

  const [ deviceCount, setDeviceCount ] = useState(0)
  const [ certCount, setCertCount ] = useState(0)
  const [ dpskCount, setDpskCount ] = useState(0)
  const [ macAddressCount, setMacAddressCount ] = useState(0)

  useEffect(() => {
    if (certTableQuery?.data) {
      setCertCount(certTableQuery.data?.totalCount ?? 0)
    }
  }, [certTableQuery?.data])

  useEffect(() => {
    if (dpskTableQuery?.data) {
      setDpskCount(dpskTableQuery.data?.totalCount ?? 0)
    }
  }, [dpskTableQuery?.data])

  useEffect(() => {
    if (macRegistrationTableQuery?.data) {
      setMacAddressCount(macRegistrationTableQuery.data?.totalCount ?? 0)
    }
  }, [macRegistrationTableQuery?.data])

  const getRevokedTitle = () => {
    return $t({
      defaultMessage: `{revokedStatus, select,
      true {Unblock}
      other {Block}
      } this Identity: {name}`,
      description: 'Translation strings - Unblock, Block, this Identity'
    }, {
      revokedStatus,
      name: title
    })
  }

  const getRevokedContent = () => {
    return $t({
      defaultMessage: `{revokedStatus, select,
      true {Are you sure you want to unblock this identity?}
      other {The user will be blocked. Are you sure want to block this identity?}
      }`,
      // eslint-disable-next-line max-len
      description: 'Translation strings - Are you sure you want to unblock this identity, The user will be blocked. Are you sure want to block this identity'
    }, {
      revokedStatus
    })
  }

  const revokePersona = async () => {
    return await updatePersona({
      params: { groupId: personaGroupId, id: personaId },
      payload: { revoked: !personaData?.revoked }
    })
  }

  const showRevokedModal = () => {
    showActionModal({
      type: 'confirm',
      title: getRevokedTitle(),
      content: getRevokedContent(),
      okText: $t({
        defaultMessage: `{revokedStatus, select,
        true {Unblock}
        other {Block}}`,
        description: 'Translation strings - Unblock, Block'
      }, { revokedStatus }),
      okType: 'primary',
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: () => revokePersona()
    })
  }

  const extra = hasCrossVenuesPermission({ needGlobalPermission: true }) ? [<Button
    type='primary'
    rbacOpsIds={[getOpsApi(PersonaUrls.updatePersona)]}
    onClick={showRevokedModal}
    disabled={!!personaData?.identityId}
  >
    {$t({
      defaultMessage: `{revokedStatus, select,
        true {Unblock}
        other {Block Identity}}`,
      description: 'Translation strings - Unblock, Block Identity'
    }, { revokedStatus })}
  </Button>,
  <Button
    type={'primary'}
    onClick={() => setEditDrawerVisible(true)}
    rbacOpsIds={[getOpsApi(PersonaUrls.updatePersona)]}
  >
    {$t({ defaultMessage: 'Configure' })}
  </Button>] : []

  // eslint-disable-next-line max-len
  const basePath = useTenantLink(`/users/identity-management/identity-group/${personaGroupId}/identity/${personaId}/`)
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const getTabComp = (activeTab?: IdentityTabKey) => {
    switch (activeTab) {
      case IdentityTabKey.CERTIFICATE:
        return personaGroupData?.certificateTemplateId
          ? <CertificateTab
            personaData={personaData}
            personaGroupData={personaGroupData}
          />
          : <></>
      case IdentityTabKey.DPSK:
        return personaGroupData?.dpskPoolId
          ? <DpskPassphraseTab
            personaData={personaData}
            personaGroupData={personaGroupData}
          />: <></>
      case IdentityTabKey.MAC:
        return personaGroupData?.macRegistrationPoolId
          ? <MacAddressTab
            personaGroupData={personaGroupData}
          /> : <></>
      case IdentityTabKey.DEVICE:
        return <IdentityClientTable
          personaId={personaId}
          personaGroupId={personaGroupId}
        />
      default:
        return <PersonaOverview
          personaData={personaData}
          personaGroupData={personaGroupData}
        />
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        titleExtra={revokedStatus
        && <>
          <PersonaBlockedIcon />
          <Tag
            style={blockedTagStyle}
            color={cssStr('--acx-semantics-red-20')}
          >
            {$t({ defaultMessage: 'Blocked' })}
          </Tag>
        </>}
        extra={filterByOperations(extra)}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Clients' })
          },
          {
            text: $t({ defaultMessage: 'Identity Management' })
          },
          {
            text: $t({ defaultMessage: 'Identities' }),
            link: 'users/identity-management/identity'
          }
        ]}
        footer={isIdentityRefactorEnabled &&
            <Tabs onChange={onTabChange} activeKey={activeTab}>
              <Tabs.TabPane
                key={IdentityTabKey.OVERVIEW}
                tab={$t(
                  { defaultMessage: 'Overview' }
                )}
              />
              <Tabs.TabPane
                key={IdentityTabKey.DEVICE}
                tab={$t(
                  { defaultMessage: 'Devices({count})' },
                  { count: deviceCount }
                )}
              />
              {personaGroupData?.certificateTemplateId
                && <Tabs.TabPane
                  key={IdentityTabKey.CERTIFICATE}
                  tab={$t(
                    { defaultMessage: 'Certificates({count})' },
                    { count: certCount }
                  )}
                />
              }
              {personaGroupData?.dpskPoolId
                && <Tabs.TabPane
                  key={IdentityTabKey.DPSK}
                  tab={$t(
                    { defaultMessage: 'DPSK Passphrases({count})' },
                    { count: dpskCount }
                  )}
                />
              }
              {personaGroupData?.macRegistrationPoolId
                && <Tabs.TabPane
                  key={IdentityTabKey.MAC}
                  tab={$t(
                    { defaultMessage: 'Mac Addresses({count})' },
                    { count: macAddressCount }
                  )}
                />
              }
            </Tabs>
        }
      />
      <Loader
        states={[
          { isLoading: false, isFetching: isPersonaLoading },
          { isLoading: false, isFetching: isPersonaGroupLoading }
        ]}
      >
        {
          isIdentityRefactorEnabled
            ? <IdentityDetailsContext.Provider
              value={{
                setDeviceCount,
                setCertCount,
                setDpskCount,
                setMacAddressCount
              }}
            >
              {getTabComp(activeTab as IdentityTabKey)}
            </IdentityDetailsContext.Provider>
            : <LegacyPersonaDetails />
        }
      </Loader>

      {personaData &&
        <PersonaDrawer
          isEdit
          visible={editDrawerVisible}
          onClose={() => setEditDrawerVisible(false)}
          data={personaData}
        />
      }

    </>
  )
}

export default PersonaDetails
