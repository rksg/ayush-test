
import { useEffect, useState } from 'react'

import { Col, Form } from 'antd'
import Paragraph     from 'antd/lib/typography/Paragraph'
import { useIntl }   from 'react-intl'

import { Button, Card, Loader, PageHeader, PasswordInput, showActionModal, Subtitle, Table, TableProps } from '@acx-ui/components'
import { CopyOutlined }                                                                                  from '@acx-ui/icons'
import {
  useGetPropertyConfigsQuery,
  useGetVenueQuery,
  useLazyGetPersonaByIdQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useUpdatePropertyUnitMutation
} from '@acx-ui/rc/services'
import { Persona, PropertyUnit, PropertyUnitFormFields, PropertyUnitStatus } from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

import { PropertyUnitDrawer }         from '../PropertyUnitDrawer'
import { PropertyUnitIdentityDrawer } from '../PropertyUnitIdentityDrawer/PropertyUnitIdentityDrawer'

import * as UI                          from './styledComponents'

export function PropertyUnitDetails () {
  const { $t } = useIntl()
  const { tenantId, venueId, unitId } = useParams()
  const [getUnitById, unitResult] = useLazyGetPropertyUnitByIdQuery()
  const [getPersonaGroupById, personaGroupResult] = useLazyGetPersonaGroupByIdQuery()
  const [getPersonaById, personaResult] = useLazyGetPersonaByIdQuery()

  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } })
  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const [updateUnitById] = useUpdatePropertyUnitMutation()
  const [enableGuestUnit, setEnableGuestUnit] = useState<boolean>(true)
  const [personaGroupId, setPersonaGroupId] = useState<string|undefined>(undefined)
  const [withPin, setWithPin] = useState(true)
  const [residentPortalUrl, setResidentPortalUrl] = useState<string|undefined>(undefined)
  const [unitData, setUnitData] = useState<PropertyUnitFormFields>()
  const [configurePropertyUnitDrawerVisible, setConfigurePropertyUnitDrawerVisible] =
    useState(false)
  const [addIdentityAssociationDrawerVisible, setAddIdentityAssociationDrawerVisible] =
    useState(false)

  useEffect(() => {
    if (!propertyConfigsQuery.isLoading && propertyConfigsQuery.data) {
      const groupId = propertyConfigsQuery.data.personaGroupId
      setPersonaGroupId(groupId)
      setEnableGuestUnit(propertyConfigsQuery.data?.unitConfig?.guestAllowed ?? false)
      getPersonaGroupById({ params: { groupId } })
        .then(result => setWithPin(!!result.data?.personalIdentityNetworkId))
    }
  }, [propertyConfigsQuery.data, propertyConfigsQuery.isLoading ])

  useEffect(() => {
    // // eslint-disable-next-line no-console
    // console.log('reset0 :: ', visible && unitId && venueId && personaGroupId)
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
        .catch(() => {
        //   errorCloseDrawer()
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
    return (<Col style={{ width: '450px', paddingLeft: 0 }}>
      <Card type='solid-bg' >
        <Subtitle level={4}>{$t({ defaultMessage: 'Unit Details' })}</Subtitle>
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
            {unitData?.status === PropertyUnitStatus.ENABLED ? 'Active' : 'Blocked'}
          </Paragraph>} />
        <Form.Item
          colon={false}
          label={$t({ defaultMessage: 'VLAN' })}
          children={<Paragraph>{unitData?.unitPersona?.vlan}</Paragraph>} />
        <Form.Item
          colon={false}
          label={$t({ defaultMessage: 'DPSK Passphrase' })}
          children={<div onClick={(e)=> {e.stopPropagation()}}>
            <PasswordInput
              bordered={false}
              value={unitData?.unitPersona?.dpskPassphrase}
              style={{ paddingLeft: '0px', width: '200px' }}
            />
            <Button
              ghost
              data-testid={'copy'}
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard
                .writeText(unitData?.unitPersona?.dpskPassphrase?.toString() ?? '')
              }
            />
          </div>} />
        <Form.Item
          colon={false}
          label={$t({ defaultMessage: 'Guest DPSK Passphrase' })}
          children={<div onClick={(e)=> {e.stopPropagation()}}>
            <PasswordInput
              bordered={false}
              value={unitData?.guestPersona?.dpskPassphrase}
              style={{ paddingLeft: '0px', width: '200px' }}
            />
            <Button
              ghost
              data-testid={'copy'}
              icon={<CopyOutlined />}
              onClick={() => navigator.clipboard
                .writeText(unitData?.guestPersona?.dpskPassphrase?.toString() ?? '')
              }
            />
          </div>} />
      </Card>
    </Col>)
  }

  const breadcrumb = [
    { text: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }), link: '/venues' },
    { text: $t({ defaultMessage: 'Property Units' }),
      link: `/venues/${venueId}/venue-details/units` }
  ]

  const columns: TableProps<PropertyUnit>['columns'] = [
    {
      key: 'identityName',
      title: $t({ defaultMessage: 'Identity Name' }),
      dataIndex: 'name',
      searchable: true
    },
    {
      key: 'status',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status'
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
      searchable: true
    },
    {
      key: 'devices',
      title: $t({ defaultMessage: 'Devices' }),
      dataIndex: 'devices'
    },
    {
      key: 'assignedAP',
      title: $t({ defaultMessage: 'Assigned AP' }),
      dataIndex: 'assignedAP'
    }
  ]

  const rowActions: TableProps<PropertyUnit>['rowActions'] =
      [
        {
          label: $t({ defaultMessage: 'Block' }),
          visible: (selectedItems => selectedItems.length <= 1 ||
          (selectedItems.length > 1)),
          onClick: (units, clearSelection) => {
            clearSelection()
          }
        },
        {
          label: $t({ defaultMessage: 'Unblock' }),
          visible: (selectedItems => selectedItems.length <= 1 ||
          (selectedItems.length > 1)),
          onClick: (units, clearSelection) => {
            clearSelection()
          }
        },
        {
          label: $t({ defaultMessage: 'Remove Association' }),
          visible: (selectedItems => selectedItems.length <= 1 ||
          (selectedItems.length > 1)),
          onClick: (units, clearSelection) => {
            clearSelection()
          }
        }
      ]

  const actions: TableProps<PropertyUnit>['actions'] =
      [{
        label: $t({ defaultMessage: 'Add Identity Association' }),
        onClick: () => {setAddIdentityAssociationDrawerVisible(true)
        }
      }]

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
      {$t({ defaultMessage: 'Identities ({count})' }, { count: 0 })}
    </Subtitle>
    <Loader
      states={[
        // queryUnitList,
        // { isFetching: propertyConfigsQuery.isFetching, isLoading: false },
        // { isFetching: personaGroupQuery.isFetching, isLoading: false }
      ]}
    >
      <Table
        rowKey='name'
        // settingsId={settingsId}
        columns={columns}
        enableApiFilter
        // onFilterChange={handleFilterChange}
        dataSource={[{ name: 't', id: 't', status: PropertyUnitStatus.DISABLED, personaId: 't' }]}
        // pagination={queryUnitList.pagination}
        // onChange={queryUnitList.handleTableChange}
        actions={actions}
        rowActions={rowActions}
        rowSelection={
          // hasPropertyUnitPermission && { type: 'checkbox' }}
          { type: 'checkbox' }}
        // iconButton={{
        //   icon: <DownloadOutlined data-testid={'export-unit'} />,
        //   tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
        //   onClick: downloadUnit
        // }}
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
        // countryCode={venueData?.address?.countryCode}
        unitId={unitId}
        // isEdit={true}
        onClose={() => {
          setAddIdentityAssociationDrawerVisible(false)
        }}
        // setVisible={setAddIdentityAssociationDrawerVisible}
      />
    }
  </>
  )
}
