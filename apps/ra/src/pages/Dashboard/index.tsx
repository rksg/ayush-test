import moment      from 'moment'
import { useIntl } from 'react-intl'

import { DidYouKnow, IncidentsCountBySeverities }          from '@acx-ui/analytics/components'
import { GridRow, GridCol, Card, PageHeader, RangePicker } from '@acx-ui/components'
import { useDashboardFilter, useDateFilter }               from '@acx-ui/utils'

export default function Dashboard () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { filters } = useDashboardFilter()

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'How is my network doing?' })}
      extra={[
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
    />
    <GridRow>
      <GridCol col={{ span: 6 }} style={{ height: 556 }}>
        <Card
          title={$t({ defaultMessage: 'Network Filter' })}
        />
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <GridRow>
          <GridCol col={{ span: 24 }} style={{ height: 110 }}>
            <Card title={$t({ defaultMessage: 'Stats' })} />
          </GridCol>
          <GridCol col={{ span: 24 }} style={{ height: 200 }}>
            <Card title={$t({ defaultMessage: 'Network History' })} />
          </GridCol>
          <GridCol col={{ span: 24 }} style={{ height: 206 }}>
            <Card title={$t({ defaultMessage: 'SLA' })} />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <GridRow>
          <GridCol col={{ span: 24 }} style={{ height: 226 }}>
            <IncidentsCountBySeverities filters={filters} />
          </GridCol>
          <GridCol col={{ span: 24 }} style={{ height: 310 }}>
            <Card title={$t({ defaultMessage: 'AI-Driven RRM' })} />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <GridRow>
          <GridCol col={{ span: 24 }} style={{ height: 226 }}>
            <DidYouKnow filters={filters} maxFactPerSlide={2} maxSlideChar={180} />
          </GridCol>
          <GridCol col={{ span: 24 }} style={{ height: 310 }}>
            <Card title={$t({ defaultMessage: 'AI Operations' })} />
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>
  </>
}
