import { useEffect, useState } from 'react'

import { Col, Input, Row, Space, Typography } from 'antd'
import { useIntl }                            from 'react-intl'
import {  useParams }                         from 'react-router-dom'

import { noDataSymbol }                                 from '@acx-ui/analytics/utils'
import { Button, cssStr, Loader, PageHeader, Subtitle } from '@acx-ui/components'
import { CopyOutlined }                                 from '@acx-ui/icons'
import {
  useLazyGetDpskQuery,
  useGetPersonaByIdQuery,
  useLazyGetMacRegListQuery,
  useLazyGetPersonaGroupByIdQuery
} from '@acx-ui/rc/services'
import { PersonaGroup } from '@acx-ui/rc/utils'

import { DpskPoolLink, MacRegistrationPoolLink, PersonaGroupLink } from '../LinkHelper'
import { PersonaDrawer }                                           from '../PersonaDrawer'

import { PersonaDevicesTable } from './PersonaDevicesTable'


function PersonaDetails () {
  const { $t } = useIntl()
  const { personaGroupId, personaId } = useParams()
  const [personaGroupData, setPersonaGroupData] = useState<PersonaGroup>()
  const [macPoolData, setMacPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [dpskPoolData, setDpskPoolData] = useState({} as { id?: string, name?: string } | undefined)
  const [editDrawerVisible, setEditDrawerVisible] = useState(false)

  // TODO: isLoading state?
  const [getPersonaGroupById] = useLazyGetPersonaGroupByIdQuery()
  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const [getDpskPoolById] = useLazyGetDpskQuery()
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
  }, [personaGroupData])

  const details = [
    { label: 'Email', value: personaDetailsQuery.data?.email },
    { label: 'Description', value: personaDetailsQuery.data?.description },
    { label: 'Persona Group',
      value:
      <PersonaGroupLink
        name={personaGroupData?.name}
        personaGroupId={personaGroupData?.id}
      />
    },
    { label: 'VLAN', value: personaDetailsQuery.data?.vlan },
    { label: 'DPSK Pool',
      value:
        <DpskPoolLink
          name={dpskPoolData?.name}
          dpskPoolId={dpskPoolData?.id}
        />
    },
    { label: 'DPSK Passphrase',
      value:
        <>
          <Input.Password
            readOnly
            bordered={false}
            value={personaDetailsQuery.data?.dpskPassphrase}
          />
          <Button
            ghost
            icon={<CopyOutlined />}
            onClick={() =>
              navigator.clipboard.writeText(personaDetailsQuery.data?.dpskPassphrase ?? '')
            }
          />
        </> },
    { label: 'MAC Registration List',
      value:
      <MacRegistrationPoolLink
        name={macPoolData?.name}
        macRegistrationPoolId={personaGroupData?.macRegistrationPoolId}
      />
    }
  ]

  // TODO: API Integration - integrate with NetworkSegmentation API
  const netSeg = [
    { label: 'Assigned VNI', value: '3000' },
    { label: 'Network Segmentation', value: 'Net seg-1' },
    { label: 'Assigned AP', value: 'AP 1' },
    { label: 'Ethernet Ports Assigned', value: 'LAN 1' }
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
                  <Col span={12}>{item.value ?? noDataSymbol}</Col>
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
                <Col span={12}>{item.value ?? noDataSymbol}</Col>
              </Row>
            )}
          </Col>
        </Row>


        <PersonaDevicesTable
          title={`${$t({ defaultMessage: 'Devices' })} (${deviceCount})`}
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

  const extra = [
    <Button key={'config-btn'} type={'primary'} onClick={onClick}>
      {$t({ defaultMessage: 'Configure' })}
    </Button>
  ]

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
