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
  { value: 2123, name: 'Requires Attention', color: cssStr('--acx-semantics-red-60') },
  { value: 322, name: 'Temporarily Degraded', color: cssStr('--acx-semantics-yellow-40') },
  { value: 50, name: 'Operational', color: cssStr('--acx-neutrals-50') },
  { value: 30000, name: 'In Setup Phase', color: cssStr('--acx-semantics-green-50') }
]

const clickHandler = (params: EventParams) => {
  // eslint-disable-next-line
  console.log('Chart clicked:', params)
}

storiesOf('Donut Chart', module)
  .addDecorator(withKnobs)
  .add('Chart View', () => {
    const { $t } = useIntl()
    return <div style={{ width: 238, height: 176 }}>
      <Card title='Venues'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              title='Wi-Fi'
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={data}/>
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
              subTitle={'With a very long subtitle..............................'}
              unit={defineMessage({ defaultMessage: `{formattedCount} {count, plural,
                one {Client}
                other {Clients}
              }` })}
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
