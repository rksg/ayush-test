import { withKnobs,object }       from '@storybook/addon-knobs'
import { storiesOf }              from '@storybook/react'
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { intlFormats } from '@acx-ui/utils'

import { cssStr }      from '../../theme/helper'
import { Card }        from '../Card'
import { EventParams } from '../Chart/helper'

import { DonutChart } from '.'

export const data = [
  { value: 2123, name: 'Requires Attention', color: cssStr('--acx-semantics-red-50') },
  { value: 322, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 30000, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

export const incidents = [
  { value: 12, name: 'P1', color: cssStr('--acx-semantics-red-50') },
  { value: 28, name: 'P2', color: cssStr('--acx-accents-orange-50') },
  { value: 42, name: 'P3', color: cssStr('--acx-semantics-yellow-50') },
  { value: 76, name: 'P4', color: cssStr('--acx-semantics-yellow-30') }
]

export const topSwitchModels = [
  { value: 13, name: 'ICX7150-C12P', color: cssStr('--acx-accents-blue-30') },
  { value: 8, name: 'ICX7150-C121P', color: cssStr('--acx-accents-blue-60') },
  { value: 7, name: 'ICX7150-C57P', color: cssStr('--acx-accents-orange-25') },
  { value: 4, name: 'ICX7150-C8', color: cssStr('--acx-accents-orange-50') },
  { value: 2, name: 'ICX7150-C0', color: cssStr('--acx-semantics-yellow-40') }
]

const clickHandler = (params: EventParams) => {
  // eslint-disable-next-line
  console.log('Chart clicked:', params)
}

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('With formatter', () => {
    const { $t } = useIntl()
    return <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              title='Wi-Fi'
              showLegend={true}
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={data}/>
          )}
        </AutoSizer>
      </Card>
    </div>
  })
  .add('With legend (name - value)', () => {
    const { $t } = useIntl()
    return <div style={{ width: 278, height: 176 }}>
      <Card title='Incidents'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              showLegend={true}
              legend='name-value'
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={incidents}/>
          )}
        </AutoSizer>
      </Card>
    </div>
  })
  .add('With subTitle', () => {
    const { $t } = useIntl()
    return <div style={{ width: 238, height: 206 }}>
      <Card title='Venues'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              showLegend={false}
              style={{ width, height }}
              title='With a very long title'
              subTitle={'This is very long subtitle and it should go to next line'}
              tooltipFormat={defineMessage({
                defaultMessage: `{name}: <b>{formattedValue} {value, plural,
                  one {Client}
                  other {Clients}
                }</b> ({formattedPercent})`
              })}
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={data}/>
          )}
        </AutoSizer>
      </Card>
    </div>
  })
  .add('No Data', () =>
    <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              title='Wi-Fi'
              data={[]}
              onClick={clickHandler}/>
          )}
        </AutoSizer>
      </Card>
    </div>)
  .add('With Knobs', () => {
    const { $t } = useIntl()
    return <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              data={object('data', data)}
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}/>
          )}
        </AutoSizer>
      </Card>
    </div>
  })
  .add('Large - with Labels', () => {
    const { $t } = useIntl()
    return <div style={{ width: 496, height: 278 }}>
      <Card title='Top 5 Switch Models'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              title='Models'
              showLabel={true}
              showTotal={false}
              showLegend={false}
              tooltipFormat={defineMessage({
                defaultMessage: `{name}<br></br>
                  <space><b>{formattedValue}</b> ({formattedPercent})</space>`
              })}
              size={'large'}
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={topSwitchModels}/>
          )}
        </AutoSizer>
      </Card>
    </div>})
