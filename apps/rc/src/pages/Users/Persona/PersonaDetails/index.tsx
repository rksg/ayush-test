import { useEffect, useState } from 'react'

import { Col, Row, Space, Tag, Typography } from 'antd'
import { useIntl }                          from 'react-intl'
import { useParams }                        from 'react-router-dom'

import { Button, cssStr, Loader, PageHeader, showActionModal, Subtitle, PasswordInput } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                     from '@acx-ui/feature-toggle'
import { CopyOutlined }                                                                 from '@acx-ui/icons'
import {
  ConnectionMeteringLink,
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PersonaGroupLink,
  PropertyUnitLink
} from '@acx-ui/rc/components'
import {
  useLazyGetDpskQuery,
  useGetPersonaByIdQuery,
  useLazyGetMacRegListQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetNetworkSegmentationGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery,
  useLazyGetConnectionMeteringByIdQuery,
  useUpdatePersonaMutation,
  useAllocatePersonaVniMutation
} from '@acx-ui/rc/services'
import { ConnectionMetering, PersonaGroup } from '@acx-ui/rc/utils'
import { filterByAccess }                   from '@acx-ui/user'
import { noDataDisplay }                    from '@acx-ui/utils'

import { PersonaDrawer }                       from '../PersonaDrawer'
import { blockedTagStyle, PersonaBlockedIcon } from '../styledComponents'

import { PersonaDevicesTable } from './PersonaDevicesTable'


function PersonaDetails () {
  const { $t } = useIntl()
  const propertyEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const networkSegmentationEnabled = useIsTierAllowed(Features.EDGES)
  const { tenantId, personaGroupId, personaId } = useParams()
  const [personaGroupData, setPersonaGroupData] = useState<PersonaGroup>()
  const [connectionMetering, setConnectionMetering] = useState<ConnectionMetering>()
  const [macPoolData, setMacPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [dpskPoolData, setDpskPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [nsgData, setNsgData] = useState({} as { id?: string, name?: string } | undefined)
  const [unitData, setUnitData] =
    useState({} as { venueId?: string, unitId?: string, name?: string } | undefined)
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)

  // TODO: isLoading state?
  const [updatePersona] = useUpdatePersonaMutation()
  const [allocatePersonaVni, { isLoading: isVniAllocating }] = useAllocatePersonaVniMutation()
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getDpskPoolById] = useLazyGetDpskQuery()
  const [getNsgById] = useLazyGetNetworkSegmentationGroupByIdQuery()
  const [getUnitById] = useLazyGetPropertyUnitByIdQuery()
  const personaDetailsQuery = useGetPersonaByIdQuery({
    params: { groupId: personaGroupId, id: personaId }
  })
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

    if (personaGroupData.nsgId && networkSegmentationEnabled) {
      let name: string | undefined
      getNsgById({ params: { tenantId, serviceId: personaGroupData.nsgId } })
        .then(result => name = result.data?.name)
        .finally(() => setNsgData({ id: personaGroupData.nsgId, name }))
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
    const hasNSG = !!personaGroupData?.nsgId

    setVniRetryable(hasNSG && primary && !revoked)
  }, [personaGroupData, personaDetailsQuery])

  const revokePersona = async () => {
    return await updatePersona({
      params: { groupId: personaGroupId, id: personaId },
      payload: { revoked: !personaDetailsQuery.data?.revoked }
    })
  }

  const allocateVni = async () => {
    return await allocatePersonaVni({
      params: { groupId: personaGroupId, id: personaId }
    })
  }

  const details = [
    { label: $t({ defaultMessage: 'Email' }), value: personaDetailsQuery.data?.email },
    { label: $t({ defaultMessage: 'Description' }), value: personaDetailsQuery.data?.description },
    { label: $t({ defaultMessage: 'Persona Group' }),
      value:
      <PersonaGroupLink
        name={personaGroupData?.name}
        personaGroupId={personaGroupData?.id}
      />
    },
    { label: $t({ defaultMessage: 'VLAN' }), value: personaDetailsQuery.data?.vlan },
    { label: $t({ defaultMessage: 'DPSK Pool' }),
      value:
        <DpskPoolLink
          name={dpskPoolData?.name}
          dpskPoolId={dpskPoolData?.id}
        />
    },
    { label: $t({ defaultMessage: 'DPSK Passphrase' }),
      value:
        <>
          <PasswordInput
            readOnly
            bordered={false}
            style={{ paddingLeft: 0 }}
            value={personaDetailsQuery.data?.dpskPassphrase}
          />
          <Button
            ghost
            data-testid={'copy'}
            icon={<CopyOutlined />}
            onClick={() =>
              navigator.clipboard.writeText(personaDetailsQuery.data?.dpskPassphrase ?? '')
            }
          />
        </>
    },
    { label: $t({ defaultMessage: 'MAC Registration List' }),
      value:
      <MacRegistrationPoolLink
        name={macPoolData?.name}
        macRegistrationPoolId={personaGroupData?.macRegistrationPoolId}
      />
    },
    ...propertyEnabled
      ? [{ label: $t({ defaultMessage: 'Unit' }),
        value:
        <PropertyUnitLink
          {...unitData}
        />
      }] : []
  ]

  const netSeg = [
    { label: $t({ defaultMessage: 'Assigned Segment No.' }),
      value: personaDetailsQuery.data?.vni ??
        (vniRetryable ?
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
    { label: $t({ defaultMessage: 'Network Segmentation' }),
      value:
      personaGroupData?.nsgId
        && <NetworkSegmentationLink
          name={nsgData?.name}
          nsgId={personaGroupData?.nsgId}
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
      <PersonaDetailsPageHeader
        title={personaDetailsQuery.data?.name ?? personaId}
        revoked={{
          status: personaDetailsQuery.data?.revoked ?? false,
          allowed: !personaDetailsQuery.data?.identityId,
          onRevoke: revokePersona
        }}
        onClick={() => setEditDrawerVisible(true)}
      />
      <Space direction={'vertical'} size={24}>
        <Row gutter={[0, 8]}>
          <Col span={12}>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Persona Details' })}
            </Subtitle>
          </Col>
          <Col span={12}>
            {(networkSegmentationEnabled && personaGroupData?.nsgId) &&
              <Subtitle level={4}>
                {$t({ defaultMessage: 'Network Segmentation' })}
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
          {(networkSegmentationEnabled && personaGroupData?.nsgId) &&
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


        <PersonaDevicesTable
          disableAddButton={!personaGroupData?.macRegistrationPoolId}
          persona={personaDetailsQuery.data}
          dpskPoolId={personaGroupData?.dpskPoolId}
        />
      </Space>

      {personaDetailsQuery.data &&
        <PersonaDrawer
          isEdit
          visible={editDrawerVisible}
          onClose={() => setEditDrawerVisible(false)}
          data={personaDetailsQuery.data}
        />
      }
    </Loader>
  )
}

function PersonaDetailsPageHeader (props: {
  title?: string,
  revoked: {
    allowed: boolean,
    status?: boolean
    onRevoke: () => void
  }
  onClick: () => void
}) {
  const { $t } = useIntl()
  const { title, revoked: { allowed, status: revokedStatus, onRevoke }, onClick } = props
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const getRevokedTitle = () => {
    return $t({
      defaultMessage: `{revokedStatus, select,
      true {Unblock}
      other {Block}
      } this Persona: {name}`,
      description: 'Translation strings - Unblock, Block, this Persona'
    }, {
      revokedStatus,
      name: title
    })
  }

  const getRevokedContent = () => {
    return $t({
      defaultMessage: `{revokedStatus, select,
      true {Are you sure you want to unblock this persona?}
      other {The user will be blocked. Are you sure want to block this persona?}
      }`,
      // eslint-disable-next-line max-len
      description: 'Translation strings - Are you sure you want to unblock this persona, The user will be blocked. Are you sure want to block this persona'
    }, {
      revokedStatus
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
      onOk: () => onRevoke()
    })
  }

  const extra = filterByAccess([
    <Button type='primary' onClick={showRevokedModal} disabled={!allowed}>
      {$t({
        defaultMessage: `{revokedStatus, select,
        true {Unblock}
        other {Block Persona}}`,
        description: 'Translation strings - Unblock, Block Persona'
      }, { revokedStatus })}
    </Button>,
    <Button type={'primary'} onClick={onClick}>
      {$t({ defaultMessage: 'Configure' })}
    </Button>
  ])

  return (
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
      extra={extra}
      breadcrumb={isNavbarEnhanced ? [
        {
          text: $t({ defaultMessage: 'Clients' })
        },
        {
          text: $t({ defaultMessage: 'Persona Management' })
        },
        {
          text: $t({ defaultMessage: 'Personas' }),
          link: 'users/persona-management/persona'
        }
      ] : [
        {
          text: $t({ defaultMessage: 'Persona' }),
          link: 'users/persona-management/persona'
        }
      ]}
    />
  )
}

export default PersonaDetails
