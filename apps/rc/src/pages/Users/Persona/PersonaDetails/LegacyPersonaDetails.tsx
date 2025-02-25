import { createContext, useEffect, useState } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'
import { useParams }                   from 'react-router-dom'

import { Button, cssStr, Loader, Subtitle, Tabs }   from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { EditOutlined }                             from '@acx-ui/icons-new'
import {
  CertificateTable,
  ConnectionMeteringLink,
  DpskPoolLink,
  IdentityGroupLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PassphraseViewer,
  PassphraseDrawer,
  PropertyUnitLink,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/components'
import {
  useAllocatePersonaVniMutation,
  useGetCertificatesByIdentityIdQuery,
  useGetCertificateTemplateQuery,
  useGetPersonaByIdQuery,
  useLazyGetConnectionMeteringByIdQuery,
  useLazyGetDpskQuery,
  useLazyGetMacRegListQuery,
  useLazyGetEdgePinByIdQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery
} from '@acx-ui/rc/services'
import { ConnectionMetering, PersonaGroup, PersonaUrls, useTableQuery } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                         from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                                     from '@acx-ui/utils'


import { PersonaDevicesTable } from './PersonaDevicesTable'

export const IdentityDeviceContext = createContext({} as {
  setDeviceCount: (data: number) => void
})

function LegacyPersonaDetails () {
  const { $t } = useIntl()
  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isCertTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const networkSegmentationEnabled = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const { tenantId, personaGroupId, personaId } = useParams()
  const [activeTab, setActiveTab] = useState('device')
  const [personaGroupData, setPersonaGroupData] = useState<PersonaGroup>()
  const [connectionMetering, setConnectionMetering] = useState<ConnectionMetering>()
  const [macPoolData, setMacPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [dpskPoolData, setDpskPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [pinData, setPinData] = useState({} as { id?: string, name?: string } | undefined)
  const [unitData, setUnitData] =
    useState({} as { venueId?: string, unitId?: string, name?: string } | undefined)
  const [editPassphraseDrawerVisible, setEditPassphraseDrawerVisible] = useState(false)

  const [deviceCount, setDeviceCount] = useState(0)

  const [allocatePersonaVni, { isLoading: isVniAllocating }] = useAllocatePersonaVniMutation()
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getDpskPoolById] = useLazyGetDpskQuery()
  const [getPinById] = useLazyGetEdgePinByIdQuery()
  const [getUnitById] = useLazyGetPropertyUnitByIdQuery()
  const personaDetailsQuery = useGetPersonaByIdQuery({
    params: { groupId: personaGroupId, id: personaId }
  })
  const { data: certTemplateData } = useGetCertificateTemplateQuery({
    params: { policyId: personaGroupData?.certificateTemplateId! }
  }, { skip: !personaGroupData?.certificateTemplateId || !isCertTemplateEnabled })
  const certTableQuery = useTableQuery({
    useQuery: useGetCertificatesByIdentityIdQuery,
    apiParams: {
      templateId: personaGroupData?.certificateTemplateId!,
      personaId: personaId!
    },
    defaultPayload: {},
    option: {
      skip: !isCertTemplateEnabled || !personaGroupData?.certificateTemplateId || !personaId
    } })

  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const [getConnectionMeteringById] = useLazyGetConnectionMeteringByIdQuery()
  const [vniRetryable, setVniRetryable] = useState<boolean>(false)

  useEffect(() => {
    if (personaDetailsQuery.isLoading) return
    if (!personaDetailsQuery.data?.groupId) return

    getPersonaGroupById({ params: { groupId: personaDetailsQuery.data?.groupId } })
      .then(result => {
        if (!result.data) return
        setPersonaGroupData(result.data)
      })
    if (isConnectionMeteringEnabled && personaDetailsQuery.data?.meteringProfileId) {
      getConnectionMeteringById({ params: { id: personaDetailsQuery.data.meteringProfileId } })
        .then(result => {
          if (result.data) {
            setConnectionMetering(result.data)
          }
        })
    }
  }, [personaDetailsQuery.data])

  useEffect(() => {
    if (!personaGroupData) return

    if (personaGroupData.macRegistrationPoolId) {
      let name: string | undefined
      getMacRegistrationById({
        params: { policyId: personaGroupData.macRegistrationPoolId }
      })
        .then(result => name = result.data?.name)
        .finally(() => setMacPoolData({ id: personaGroupData.macRegistrationPoolId, name }))
    }

    if (personaGroupData.dpskPoolId) {
      let name: string | undefined
      getDpskPoolById({
        params: { serviceId: personaGroupData.dpskPoolId }
      })
        .then(result => name = result.data?.name)
        .finally(() => setDpskPoolData({ id: personaGroupData.dpskPoolId, name }))
    }

    if (personaGroupData.personalIdentityNetworkId && networkSegmentationEnabled) {
      let name: string | undefined
      getPinById({ params: { tenantId, serviceId: personaGroupData.personalIdentityNetworkId } })
        .then(result => name = result.data?.name)
        .finally(() => setPinData({ id: personaGroupData.personalIdentityNetworkId, name }))
    }

    if (propertyEnabled && personaGroupData.propertyId && personaDetailsQuery?.data?.identityId) {
      const venueId = personaGroupData.propertyId
      const unitId = personaDetailsQuery.data.identityId
      let name: string | undefined

      getUnitById({ params: { venueId , unitId } })
        .then(result => name = result.data?.name)
        .finally(() => setUnitData({ venueId, unitId, name }))
    }
  }, [personaGroupData])

  useEffect(() => {
    if (!personaGroupData || !personaDetailsQuery.data) return
    const { primary = true, revoked } = personaDetailsQuery.data
    const hasPin = !!personaGroupData?.personalIdentityNetworkId

    setVniRetryable(hasPin && primary && !revoked)
  }, [personaGroupData, personaDetailsQuery])

  const allocateVni = async () => {
    return await allocatePersonaVni({
      params: { groupId: personaGroupId, id: personaId }
    })
  }

  const details = [
    { label: $t({ defaultMessage: 'Email' }), value: personaDetailsQuery.data?.email },
    { label: $t({ defaultMessage: 'Description' }), value: personaDetailsQuery.data?.description },
    { label: $t({ defaultMessage: 'Identity Group' }),
      value:
        <IdentityGroupLink
          name={personaGroupData?.name}
          personaGroupId={personaGroupData?.id}
        />
    },
    { label: $t({ defaultMessage: 'VLAN' }), value: personaDetailsQuery.data?.vlan },
    { label: $t({ defaultMessage: 'DPSK Service' }),
      value:
        <DpskPoolLink
          showNoData={true}
          name={dpskPoolData?.name}
          dpskPoolId={dpskPoolData?.id}
        />
    },
    { label: $t({ defaultMessage: 'DPSK Passphrase' }),
      value:
        <>
          {
            personaDetailsQuery.data?.dpskPassphrase
              ? <PassphraseViewer
                passphrase={personaDetailsQuery.data?.dpskPassphrase ?? ''}
              />
              : noDataDisplay
          }
          <Button
            ghost
            icon={<EditOutlined size='sm' />}
            onClick={() => setEditPassphraseDrawerVisible(true)}
          />
        </>
    },
    { label: $t({ defaultMessage: 'MAC Registration List' }),
      value:
        <MacRegistrationPoolLink
          showNoData={true}
          name={macPoolData?.name}
          macRegistrationPoolId={personaGroupData?.macRegistrationPoolId}
        />
    },
    ...propertyEnabled
      ? [{ label: $t({ defaultMessage: 'Unit' }),
        value:
          <PropertyUnitLink
            showNoData={true}
            {...unitData}
          />
      }] : []
  ]

  const netSeg = [
    { label: $t({ defaultMessage: 'Assigned Segment No.' }),
      value: personaDetailsQuery.data?.vni ??
        ((hasAllowedOperations([getOpsApi(PersonaUrls.allocateVni)]) && vniRetryable) ?
          <Space size={'middle'} align={'center'}>
            <Typography.Text>{noDataDisplay}</Typography.Text>
            <Button
              size={'small'}
              type={'default'}
              onClick={allocateVni}
              loading={isVniAllocating}
            >
              {$t({ defaultMessage: 'Retry Segment No.' })}
            </Button>
          </Space> : undefined)
    },
    { label: $t({ defaultMessage: 'Personal Identity Network' }),
      value:
        personaGroupData?.personalIdentityNetworkId
        && <NetworkSegmentationLink
          showNoData={true}
          name={pinData?.name}
          id={personaGroupData?.personalIdentityNetworkId}
        />
    },
    // TODO: API Integration - Fetch AP(get AP by port.macAddress?)
    { label: $t({ defaultMessage: 'Assigned AP' }),
      value:
        personaDetailsQuery.data?.ethernetPorts?.length !== 0
          ? [...new Set(personaDetailsQuery.data?.ethernetPorts?.map(port => port.name))].join(', ')
          : undefined
    },
    { label: $t({ defaultMessage: 'Ethernet Ports Assigned' }),
      value:
        personaDetailsQuery.data?.ethernetPorts?.length !== 0
          ? personaDetailsQuery.data?.ethernetPorts?.map(port => {
            return `LAN ${port.portIndex}`
          }).join(', ')
          : undefined
    }
  ]

  return (
    <Loader
      states={[personaDetailsQuery]}
    >
      <Space direction={'vertical'} size={24}>
        <Row gutter={[0, 8]}>
          <Col span={12}>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Identity Details' })}
            </Subtitle>
          </Col>
          <Col span={12}>
            {(networkSegmentationEnabled && personaGroupData?.personalIdentityNetworkId) &&
              <Subtitle level={4}>
                {$t({ defaultMessage: 'Personal Identity Network' })}
              </Subtitle>
            }
          </Col>
          <Col span={12}>
            <Loader >
              {details.map(item =>
                <Row key={item.label} align={'middle'}>
                  <Col span={7}>
                    <Typography.Paragraph
                      style={{ margin: 0, padding: '6px 0px', color: cssStr('--acx-neutrals-70') }}
                    >
                      {item.label}:
                    </Typography.Paragraph>
                  </Col>
                  <Col span={12}>{item.value ?? noDataDisplay}</Col>
                </Row>
              )}
            </Loader>
          </Col>
          {(networkSegmentationEnabled && personaGroupData?.personalIdentityNetworkId) &&
            <Col span={12}>
              {netSeg.map(item =>
                <Row key={item.label} align={'middle'}>
                  <Col span={7}>
                    <Typography.Paragraph
                      style={{ margin: 0, padding: '6px 0px', color: cssStr('--acx-neutrals-70') }}
                    >
                      {item.label}:
                    </Typography.Paragraph>
                  </Col>
                  <Col span={12}>{item.value ?? noDataDisplay}</Col>
                </Row>
              )}
              {
                isConnectionMeteringEnabled &&
                <Row key={'Data Usage Metering'} align={'middle'}>
                  <Col span={7}>
                    <Typography.Paragraph
                      style={{ margin: 0, padding: '6px 0px', color: cssStr('--acx-neutrals-70') }}
                    >
                      {$t({ defaultMessage: 'Data Usage Metering' })}:
                    </Typography.Paragraph>
                  </Col>
                  <Col span={12}>{connectionMetering ?
                    <ConnectionMeteringLink
                      id={connectionMetering.id}
                      name={connectionMetering.name}/> :
                    noDataDisplay}
                  </Col>
                </Row>
              }
            </Col>
          }
        </Row>

        <Tabs onChange={setActiveTab} activeKey={activeTab}>
          <Tabs.TabPane
            key={'device'}
            tab={$t(
              { defaultMessage: 'Devices ({deviceCount})' },
              { deviceCount }
            )}
          >
            <IdentityDeviceContext.Provider value={{ setDeviceCount }}>
              <PersonaDevicesTable
                disableAddButton={!personaGroupData?.macRegistrationPoolId}
                persona={personaDetailsQuery.data}
                dpskPoolId={personaGroupData?.dpskPoolId}
              />
            </IdentityDeviceContext.Provider>
          </Tabs.TabPane>
          {(isCertTemplateEnabled && personaGroupData?.certificateTemplateId && certTemplateData) &&
            <Tabs.TabPane
              key={'certificate'}
              tab={$t(
                { defaultMessage: 'Certificates ({certificateCount})' },
                { certificateCount: certTableQuery?.data?.totalCount ?? 0 }
              )}
            >
              <CertificateTable
                showGenerateCert={!personaDetailsQuery.data?.revoked ?? false}
                templateData={certTemplateData}
                tableQuery={certTableQuery}
                specificIdentity={personaId}
              />
            </Tabs.TabPane>
          }
        </Tabs>
      </Space>

      { (personaDetailsQuery.data && editPassphraseDrawerVisible) &&
        <PassphraseDrawer
          visible={editPassphraseDrawerVisible}
          onClose={()=>{
            setEditPassphraseDrawerVisible(false)
          }}
          persona={personaDetailsQuery.data}
        />
      }
    </Loader>
  )
}

export default LegacyPersonaDetails
