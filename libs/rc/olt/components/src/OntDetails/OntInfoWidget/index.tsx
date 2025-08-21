import { useIntl } from 'react-intl'

import { Card, GridRow,  GridCol } from '@acx-ui/components'
import { Client }                  from '@acx-ui/icons'
import { LightningSolid }          from '@acx-ui/icons-new'
import { OltOnt }                  from '@acx-ui/olt/utils'

import * as UI from './styledComponents'

interface OntInfoWidgetProps {
  ontDetails: OltOnt
  isLoading: boolean,
  isFetching: boolean
}

function InfoWidget (props: {
  title: string,
  data: number | string,
  icon?: React.ReactNode
}) {
  const { title, data, icon } = props
  return <UI.InfoWrapper>
    {icon && <div>{ icon }</div>}
    <UI.InfoTitle>{ title }</UI.InfoTitle>
    <UI.InfoData>{ data }</UI.InfoData>
  </UI.InfoWrapper>
}

export const OntInfoWidget = (props: OntInfoWidgetProps) => {
  const { $t } = useIntl()
  const { ontDetails } = props

  return <GridRow style={{ marginBottom: '12px' }}>
    <GridCol col={{ span: 24 }} style={{ height: '140px' }}>
      <Card type='solid-bg'>
        <GridRow style={{ flexGrow: '1', justifyContent: 'center', alignItems: 'center' }}>
          <GridCol col={{ span: 5 }}>
            <InfoWidget
              title={$t({ defaultMessage: 'Clients' })}
              data={ontDetails.clientDetails?.length ?? 0}
              icon={<Client />}
            />
          </GridCol>
          <GridCol col={{ span: 5 }}>
            <InfoWidget title={$t({ defaultMessage: 'Uptime' })} data={'%uptime%'} />
          </GridCol>
          <GridCol col={{ span: 5 }}>
            <InfoWidget title={$t({ defaultMessage: 'RSS' })} data={'%rss%'} />
          </GridCol>
          <GridCol col={{ span: 6 }}>
            <InfoWidget
              title={$t({ defaultMessage: 'PoE utilization' })}
              data={'%poe_utilization%'}
              icon={<LightningSolid size='lg' />}
            />
          </GridCol>
        </GridRow>
      </Card>
    </GridCol>
  </GridRow>
}