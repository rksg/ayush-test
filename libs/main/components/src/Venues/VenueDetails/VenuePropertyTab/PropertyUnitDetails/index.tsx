
import { useEffect, useState } from 'react'

import { Col, Form } from 'antd'
import Paragraph     from 'antd/lib/typography/Paragraph'
import { useIntl }   from 'react-intl'

import { Button, Card, Loader, PageHeader, PasswordInput, showActionModal, Subtitle, Table, TableProps, Tooltip } from '@acx-ui/components'
import { CopyOutlined }                                                                                           from '@acx-ui/icons'
import {
  useDeletePersonaAssociationMutation,
  useGetPersonaIdentitiesQuery,
  useGetPropertyConfigsQuery,
  useGetVenueQuery,
  useLazyGetPersonaByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useSearchPersonaListQuery,
  useUpdatePersonaMutation,
  useUpdatePropertyUnitMutation
} from '@acx-ui/rc/services'
import { FILTER, Persona, PropertyUnit, PropertyUnitFormFields, PropertyUnitStatus, SEARCH, useTableQuery } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { noDataDisplay }  from '@acx-ui/utils'

import { PropertyUnitDrawer }         from '../PropertyUnitDrawer'
import { PropertyUnitIdentityDrawer } from '../PropertyUnitIdentityDrawer/PropertyUnitIdentityDrawer'

import * as UI from './styledComponents'

export function PropertyUnitDetails () {
  const { $t } = useIntl()
  const { tenantId, venueId, unitId } = useParams()
  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaById] = useLazyGetPersonaByIdQuery()
  const [identitiesCount, setIdentitiesCount] = useState(0)
  const identities = useGetPersonaIdentitiesQuery({ params: { venueId, unitId },
    payload: { pageSize: 10000, page: 1, sortOrder: 'ASC' } })

  const settingsId = 'property-units-identity-table'
  const identitiesList = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    pagination: { pageSize: 10, settingsId },
    defaultPayload: { keyword: '' }
  })
  useEffect(() => {
    setIdentitiesCount(identitiesList.data?.totalCount || 0)
  }, [identitiesList.data])

  useEffect(() => {
    const payload = {
      ...identitiesList.payload,
      ids: identities.data?.data.map(identity => identity.personaId) ?? []
    }
    identitiesList.setPayload(payload)
  }, [identities.data])

  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const [updateUnitById] = useUpdatePropertyUnitMutation()
  const [updatePersona] = useUpdatePersonaMutation()
  const [deletePersonaAssociation] = useDeletePersonaAssociationMutation()
  const [personaGroupId, setPersonaGroupId] = useState<string|undefined>(undefined)
  const [residentPortalUrl, setResidentPortalUrl] = useState<string|undefined>(undefined)
  const [unitData, setUnitData] = useState<PropertyUnitFormFields>()
  const [configurePropertyUnitDrawerVisible, setConfigurePropertyUnitDrawerVisible] =
    useState(false)
  const [addIdentityAssociationDrawerVisible, setAddIdentityAssociationDrawerVisible] =
    useState(false)
  const copyButtonTooltipDefaultText = $t({ defaultMessage: 'Copy Passphrase' })
  const copyButtonTooltipCopiedText = $t({ defaultMessage: 'Passphrase Copied' })
  const [ copyButtonTooltip, setCopyTooltip ] = useState(copyButtonTooltipDefaultText)
  const [ guestCopyButtonTooltip, setGuestCopyTooltip ] = useState(copyButtonTooltipDefaultText)

  useEffect(() => {
    if (!propertyConfigsQuery.isLoading && propertyConfigsQuery.data) {
      const groupId = propertyConfigsQuery.data.personaGroupId
      setPersonaGroupId(groupId)
    }
  }, [propertyConfigsQuery.data, propertyConfigsQuery.isLoading ])

  useEffect(() => {
    if (unitId && venueId && personaGroupId) {
      getUnitById({ params: { venueId, unitId } })
        .then(result => {
          if (result.data) {
            const { personaId, guestPersonaId } = result.data
            combinePersonaInfo(result.data, personaId, guestPersonaId)
            const url = (result.data as PropertyUnit)?._links?.residentPortal?.href
            if (url) {
              setResidentPortalUrl(url)
            }
          }
        })
    }
  }, [unitId, personaGroupId])

  const combinePersonaInfo = (
    unitData: PropertyUnit,
    personaId?: string,
    guestPersonaId?: string
  ) => {
    let unitFormFields: PropertyUnitFormFields = unitData
    let personaPromise, guestPromise
    if (personaId) {
      personaPromise = getPersonaById({ params: { groupId: personaGroupId, id: personaId } })
    }
    if (guestPersonaId) {
      guestPromise = getPersonaById({ params: { groupId: personaGroupId, id: guestPersonaId } })
    }
    Promise.all([personaPromise, guestPromise])
      .then(([personaResult, guestResult]) => {
        if (personaResult?.data) {
          const { vlan, dpskPassphrase } = personaResult.data as Persona
          unitFormFields = {
            ...unitFormFields,
            unitPersona: { vlan, dpskPassphrase }
          }
        }
        if (guestResult?.data) {
          const { vlan, dpskPassphrase } = guestResult.data
          unitFormFields = {
            ...unitFormFields,
            enableGuestVlan: personaResult?.data?.vlan !== vlan,
            guestPersona: { vlan, dpskPassphrase }
          }
        }
        setUnitData(unitFormFields)
      })
  }

  const handleSuspend = () => {
    showActionModal({
      type: 'confirm',
      title: $t({
        defaultMessage: 'Suspend "{entityValue}"?' }, {
        entityValue: unitResult.data?.name
      }),
      content: $t({ defaultMessage: 'Are you sure you want to suspend this unit?' }),
      okText: $t({ defaultMessage: 'Suspend' }),
      onOk () {
        updateUnitById({
          params: { venueId, unitId: unitId },
          payload: { status: PropertyUnitStatus.DISABLED }
        })
      }
    })
  }

  const UnitDetails = () => {
    return (<Col style={{ paddingLeft: 0 }}>
      <Card type='solid-bg' >
        <UI.DetailsWrapper>
          <Subtitle level={4} style={{ marginBottom: '10px' }}>
            {$t({ defaultMessage: 'Unit Details' })}
          </Subtitle>
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'Resident\'s Name' })}
            children={<Paragraph>{unitData?.resident?.name}</Paragraph>}/>
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'Resident\'s Email' })}
            children={<Paragraph>{unitData?.resident?.email}</Paragraph>} />
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'Status' })}
            children={<Paragraph>
              {unitData?.status === PropertyUnitStatus.ENABLED ? $t({ defaultMessage: 'Active' })
                : $t({ defaultMessage: 'Blocked' })}
            </Paragraph>} />
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'VLAN' })}
            children={<Paragraph>{unitData?.unitPersona?.vlan}</Paragraph>} />
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'DPSK Passphrase' })}
            children={unitData?.unitPersona?.dpskPassphrase
              ? <div onClick={(e)=> {e.stopPropagation()}}>
                <PasswordInput
                  bordered={false}
                  value={unitData?.unitPersona?.dpskPassphrase}
                  style={{ paddingLeft: '0px', width: '200px' }}
                />
                <Tooltip title={copyButtonTooltip}>
                  <Button
                    ghost
                    data-testid={'copy'}
                    icon={<CopyOutlined />}
                    onMouseOut={() => setCopyTooltip(copyButtonTooltipDefaultText)}
                    onClick={() => {
                      const passphrase = unitData?.unitPersona?.dpskPassphrase?.toString() ?? ''
                      navigator.clipboard.writeText(passphrase)
                      setCopyTooltip(copyButtonTooltipCopiedText)
                    }}
                  />
                </Tooltip>
              </div>
              : <Paragraph>{noDataDisplay}</Paragraph>} />
          <Form.Item
            colon={false}
            label={$t({ defaultMessage: 'Guest DPSK Passphrase' })}
            children={unitData?.guestPersona?.dpskPassphrase
              ? <div onClick={(e)=> {e.stopPropagation()}}>
                <PasswordInput
                  bordered={false}
                  value={unitData?.guestPersona?.dpskPassphrase}
                  style={{ paddingLeft: '0px', width: '200px' }}
                />
                <Tooltip title={guestCopyButtonTooltip}>
                  <Button
                    ghost
                    data-testid={'guest-copy'}
                    icon={<CopyOutlined />}
                    onMouseOut={() => setGuestCopyTooltip(copyButtonTooltipDefaultText)}
                    onClick={() => {
                      const passphrase = unitData?.guestPersona?.dpskPassphrase?.toString() ?? ''
                      navigator.clipboard.writeText(passphrase)
                      setGuestCopyTooltip(copyButtonTooltipCopiedText)
                    }}
                  />
                </Tooltip>
              </div>
              : <Paragraph>{noDataDisplay}</Paragraph>} />
        </UI.DetailsWrapper>
      </Card>
    </Col>)
  }

  const breadcrumb = [
    { text: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }), link: '/venues' },
    { text: $t({ defaultMessage: 'Property Units' }),
      link: `/venues/${venueId}/venue-details/units` }
  ]

  const columns: TableProps<Persona>['columns'] = [
    {
      key: 'identityName',
      title: $t({ defaultMessage: 'Identity Name' }),
      dataIndex: 'name',
      searchable: true
    },
    {
      key: 'revoked',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'revoked',
      width: 90,
      render: function (_, row) {
        return row.revoked ? $t({ defaultMessage: 'Blocked' }) : $t({ defaultMessage: 'Active' })
      }
    },
    {
      key: 'email',
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      searchable: true
    },
    {
      key: 'description',
      title: $t({ defaultMessage: 'Description' }),
      dataIndex: 'description',
      searchable: true,
      width: 200
    },
    {
      key: 'deviceCount',
      title: $t({ defaultMessage: 'Devices' }),
      dataIndex: 'deviceCount',
      align: 'center'
    },
    {
      key: 'assignedAP',
      title: $t({ defaultMessage: 'Assigned AP' }),
      dataIndex: 'assignedAP',
      render: function (_, row) {
        return row?.ethernetPorts?.[0]?.name
      }
    }
  ]

  const rowActions: TableProps<Persona>['rowActions'] =
      [
        {
          label: $t({ defaultMessage: 'Block' }),
          visible: (selectedItems => selectedItems.length > 0 &&
            selectedItems.some(p => !p.revoked)),
          onClick: (identities, clearSelection) => {
            showActionModal({
              type: 'confirm',
              title: identities.length > 1
                ? $t({ defaultMessage: 'Block {count} identities' }, { count: identities.length })
                : $t({ defaultMessage: 'Block this identity: {name}' },
                  { name: identities[0].name }),
              content: identities.length > 1 ?
                $t({ defaultMessage: 'The users will be blocked. ' +
                  'Are you sure want to block these identities?' })
                : $t({ defaultMessage: 'The user will be blocked. ' +
                  'Are you sure want to block this identity?' }),
              okText: $t({ defaultMessage: 'Block' }),
              okType: 'primary',
              cancelText: $t({ defaultMessage: 'Cancel' }),
              onOk: () => {
                identities.forEach((identity) => {
                  updatePersona({
                    params: { groupId: personaGroupId, id: identity.id },
                    payload: { revoked: true }
                  }).then(() => clearSelection())
                })
              }
            })
          }
        },
        {
          label: $t({ defaultMessage: 'Unblock' }),
          visible: (selectedItems => selectedItems.length > 0 &&
            selectedItems.some(p => p.revoked)),
          onClick: (identities, clearSelection) => {
            identities.forEach((identity) => {
              updatePersona({
                params: { groupId: personaGroupId, id: identity.id },
                payload: { revoked: false }
              }).then(() => clearSelection())
            })
          }
        },
        {
          label: $t({ defaultMessage: 'Remove Association' }),
          visible: (selectedItems => selectedItems.length > 0),
          onClick: (identities, clearSelection) => {
            showActionModal({
              type: 'confirm',
              title: identities.length > 1
                ? $t({ defaultMessage: 'Remove {count} associations' },
                  { count: identities.length })
                : $t({ defaultMessage: 'Remove this association: {name}' },
                  { name: identities[0].name }),
              content: identities.length > 1 ?
                $t({ defaultMessage: 'Are you sure want to remove these associations?' })
                : $t({ defaultMessage: 'Are you sure want to remove this association?' }),
              okText: $t({ defaultMessage: 'Remove Association' }),
              okType: 'primary',
              cancelText: $t({ defaultMessage: 'Cancel' }),
              onOk: () => {
                identities.forEach((identity) => {
                  deletePersonaAssociation({
                    params: { venueId, unitId, identityId: identity.id }
                  }).then(() => clearSelection())
                })
              }
            })
          }
        }
      ]

  const actions: TableProps<PropertyUnit>['actions'] =
      [{
        label: $t({ defaultMessage: 'Add Identity Association' }),
        onClick: () => {setAddIdentityAssociationDrawerVisible(true)}
      }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const payload = {
      ...identitiesList.payload,
      keyword: customSearch?.searchString ?? ''
    }
    identitiesList.setPayload(payload)
  }

  return (<>
    <PageHeader
      title={unitResult.data?.name || ''}
      breadcrumb={breadcrumb}
      extra={[
        <Button
          onClick={handleSuspend}
        >{$t({ defaultMessage: 'Suspend' })} </Button>,
        <Button
          onClick={() => {
            window.open(residentPortalUrl, '_blank')
          }}
        >{$t({ defaultMessage: 'View Portal' })} </Button>,
        <Button
          type='primary'
          onClick={() => {setConfigurePropertyUnitDrawerVisible(true)}}
        >{$t({ defaultMessage: 'Configure' })} </Button>
      ]}
    />
    <UnitDetails />
    <Subtitle level={3} style={{ marginTop: '20px', marginBottom: '0' }}>
      {$t({ defaultMessage: 'Identities ({count})' },
        { count: identitiesCount ?? 0 })}
    </Subtitle>
    <Loader states={[ identitiesList ]}>
      <Table
        rowKey='name'
        settingsId={settingsId}
        columns={columns}
        enableApiFilter
        dataSource={identitiesList.data?.data}
        onChange={identitiesList.handleTableChange}
        onFilterChange={handleFilterChange}
        actions={filterByAccess(actions)}
        rowActions={filterByAccess(rowActions)}
        rowSelection={{ type: 'checkbox' }}
      />
    </Loader>
    {venueId && configurePropertyUnitDrawerVisible &&
      <PropertyUnitDrawer
        visible={configurePropertyUnitDrawerVisible}
        venueId={venueId}
        countryCode={venueData?.address?.countryCode}
        unitId={unitId}
        isEdit={true}
        onClose={() => setConfigurePropertyUnitDrawerVisible(false)}
      />
    }
    {addIdentityAssociationDrawerVisible &&
      <PropertyUnitIdentityDrawer
        visible={addIdentityAssociationDrawerVisible}
        venueId={venueId}
        unitId={unitId}
        groupId={personaGroupId}
        onClose={() => {
          setAddIdentityAssociationDrawerVisible(false)
          identities.refetch()
        }}
      />
    }
  </>
  )
}
