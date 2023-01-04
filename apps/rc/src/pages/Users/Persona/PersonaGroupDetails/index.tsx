import { useEffect, useState } from 'react'

import { Descriptions, Space } from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { noDataSymbol }                               from '@acx-ui/analytics/utils'
import { Button, Card, Loader, PageHeader, Subtitle } from '@acx-ui/components'
import {
  useGetPersonaGroupByIdQuery,
  useLazyGetMacRegListQuery
} from '@acx-ui/rc/services'

import { DpskPoolLink, MacRegistrationPoolLink, NetworkSegmentationLink } from '../LinkHelper'
import { PersonaGroupDrawer }                                             from '../PersonaGroupDrawer'
import { BasePersonaTable }                                               from '../PersonaTable/BasePersonaTable'



function PersonaGroupDetailsPageHeader (props: {
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
          text: $t({ defaultMessage: 'Persona Group' }),
          link: 'users/persona-management'
        }
      ]}
    />
  )
}

function PersonaGroupDetails () {
  const { $t } = useIntl()
  const { personaGroupId } = useParams()
  const [editVisible, setEditVisible] = useState(false)
  const [macPoolDisplay, setMacPoolDisplay] = useState<{ id?: string, name?: string }>()

  const [getMacRegistrationById] = useLazyGetMacRegListQuery()
  const detailsQuery = useGetPersonaGroupByIdQuery({
    params: { groupId: personaGroupId }
  })

  useEffect(() => {
    if (detailsQuery.isLoading) return

    const macPoolId = detailsQuery.data?.macRegistrationPoolId

    if (macPoolId) {
      getMacRegistrationById({ params: { policyId: macPoolId } })
        .then(result => {
          if (result.data) {
            setMacPoolDisplay({ id: macPoolId, name: result.data.name })
          }
        })
    }
  }, [detailsQuery.data])

  const basicInfo = [
    {
      title: $t({ defaultMessage: 'Venue' })
      // TODO: Integrate API to fetch Venue belonging to this PersonaGroup and linked
    },
    {
      title: $t({ defaultMessage: 'Personas' }),
      value: detailsQuery.data?.personas?.length ?? 0
    },
    {
      title: $t({ defaultMessage: 'DPSK Pool' }),
      // TODO: Integrate API to fetch dpsk pool name and linked
      value:
      <DpskPoolLink
        dpskPoolId={detailsQuery.data?.dpskPoolId}
      />
    },
    {
      title: $t({ defaultMessage: 'MAC Registration' }),
      value:
        <MacRegistrationPoolLink
          name={macPoolDisplay?.name}
          macRegistrationPoolId={detailsQuery.data?.macRegistrationPoolId}
        />
    },
    {
      title: $t({ defaultMessage: 'Network Segmentation' }),
      // TODO: Integrate API to fetch nsg name and linked
      value:
        <NetworkSegmentationLink
          nsgId={detailsQuery.data?.nsgId}
        />
    }
  ]

  return (
    <>
      <PersonaGroupDetailsPageHeader
        title={detailsQuery.data?.name ?? personaGroupId}
        onClick={() => setEditVisible(true)}
      />
      <Space direction={'vertical'} size={24}>
        <Loader states={[detailsQuery]}>
          <Card type={'solid-bg'}>
            <Descriptions
              layout={'vertical'}
              column={7}
              size={'small'}
              colon={false}
              style={{ padding: '8px 14px' }}
            >
              {
                basicInfo.map(info =>
                  <Descriptions.Item
                    key={info.title}
                    label={info.title}
                  >
                    {info.value ?? noDataSymbol}
                  </Descriptions.Item>
                )
              }
            </Descriptions>
          </Card>
        </Loader>

        <div>
          <Subtitle level={4}>
            {/* eslint-disable-next-line max-len */}
            {$t({ defaultMessage: 'Personas' })} ({detailsQuery.data?.personas?.length ?? noDataSymbol})
          </Subtitle>

          <BasePersonaTable
            colProps={{
              name: { searchable: true },
              groupId: { show: false }
            }}/>
        </div>
      </Space>

      {detailsQuery.data &&
        <PersonaGroupDrawer
          isEdit
          visible={editVisible}
          data={detailsQuery.data}
          onClose={() => setEditVisible(false)}
        />
      }
    </>
  )
}

export default PersonaGroupDetails
