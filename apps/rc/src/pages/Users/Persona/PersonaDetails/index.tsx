import { useEffect, useState } from 'react'

import { Col, Input, Row, Space, Typography } from 'antd'
import { useIntl }                            from 'react-intl'
import {  useParams }                         from 'react-router-dom'

import { Button, cssStr, Loader, PageHeader, Subtitle } from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { CopyOutlined }                                 from '@acx-ui/icons'
import {
  useLazyGetDpskQuery,
  useGetPersonaByIdQuery,
  useLazyGetMacRegListQuery,
  useLazyGetPersonaGroupByIdQuery,
  useLazyGetNetworkSegmentationGroupByIdQuery,
  useLazyGetPropertyUnitByIdQuery
} from '@acx-ui/rc/services'
import { PersonaGroup }   from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'
import { noDataDisplay }  from '@acx-ui/utils'

import {
  DpskPoolLink,
  MacRegistrationPoolLink,
  NetworkSegmentationLink,
  PersonaGroupLink,
  PropertyUnitLink
} from '../LinkHelper'
import { PersonaDrawer } from '../PersonaDrawer'

import { PersonaDevicesTable } from './PersonaDevicesTable'


function PersonaDetails () {
  const { $t } = useIntl()
  const propertyEnabled = useIsSplitOn(Features.PROPERTY_MANAGEMENT)
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)
  const { tenantId, personaGroupId, personaId } = useParams()
  const [personaGroupData, setPersonaGroupData] = useState<PersonaGroup>()
  const [macPoolData, setMacPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [dpskPoolData, setDpskPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [nsgData, setNsgData] = useState({} as { id?: string, name?: string } | undefined)
  const [unitData, setUnitData] =
    useState({} as { venueId?: string, unitId?: string, name?: string } | undefined)
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)

  // TODO: isLoading state?
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getDpskPoolById] = useLazyGetDpskQuery()
  const [getNsgById] = useLazyGetNetworkSegmentationGroupByIdQuery()
  const [getUnitById] = useLazyGetPropertyUnitByIdQuery()
  const personaDetailsQuery = useGetPersonaByIdQuery({
    params: { groupId: personaGroupId, id: personaId }
  })
  const deviceCount = personaDetailsQuery.data?.devices?.length ?? 0

  useEffect(() => {
    if (personaDetailsQuery.isLoading) return
    if (!personaDetailsQuery.data?.groupId) return

    getPersonaGroupById({ params: { groupId: personaDetailsQuery.data?.groupId } })
      .then(result => {
        if (!result.data) return
        setPersonaGroupData(result.data)
      })
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
          <Input.Password
            readOnly
            bordered={false}
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
    { label: $t({ defaultMessage: 'Assigned VNI' }),
      value: personaDetailsQuery.data?.vni
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
          ? personaDetailsQuery.data?.ethernetPorts?.map(port => port.name)
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
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Network Segmentation' })}
            </Subtitle>
          </Col>
          <Col span={12}>
            <Loader >
              {details.map(item =>
                <Row key={item.label}>
                  <Col span={7}>
                    <Typography.Paragraph style={{ color: cssStr('--acx-neutrals-70') }}>
                      {item.label}:
                    </Typography.Paragraph>
                  </Col>
                  <Col span={12}>{item.value ?? noDataDisplay}</Col>
                </Row>
              )}
            </Loader>
          </Col>
          <Col span={12}>
            {netSeg.map(item =>
              <Row key={item.label}>
                <Col span={7}>
                  <Typography.Paragraph style={{ color: cssStr('--acx-neutrals-70') }}>
                    {item.label}:
                  </Typography.Paragraph>
                </Col>
                <Col span={12}>{item.value ?? noDataDisplay}</Col>
              </Row>
            )}
          </Col>
        </Row>


        <PersonaDevicesTable
          title={$t({ defaultMessage: 'Devices ({deviceCount})' }, { deviceCount })}
          persona={personaDetailsQuery.data}
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
  onClick: () => void
}) {
  const { $t } = useIntl()
  const { title, onClick } = props

  const extra = filterByAccess([
    <Button type={'primary'} onClick={onClick}>
      {$t({ defaultMessage: 'Configure' })}
    </Button>
  ])

  return (
    <PageHeader
      title={title}
      extra={extra}
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Persona' }),
          link: 'users/persona-management/persona'
        }
      ]}
    />
  )
}

export default PersonaDetails
