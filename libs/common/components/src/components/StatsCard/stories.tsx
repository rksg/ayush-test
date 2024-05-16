import { storiesOf }     from '@storybook/react'
import { defineMessage } from 'react-intl'

import { GridRow, GridCol } from '../Grid'

import { StatsCard, StatsCardProps } from '.'

const data1: StatsCardProps[] = [
  {
    type: 'green',
    values: [{
      title: defineMessage({ defaultMessage: 'Successful Connections' }),
      value: '130.92K',
      suffix: '/152.81K'
    }],
    onClick: () => {}
  },
  {
    type: 'red',
    values: [{
      title: defineMessage({ defaultMessage: 'Failed Connections' }),
      value: '21.89K',
      suffix: '/152.81K'
    }],
    onClick: () => {}
  },
  {
    type: 'yellow',
    values: [{
      title: defineMessage({ defaultMessage: 'Connection Success Ratio' }),
      value: '85.68%'
    }],
    onClick: () => {}
  },
  {
    type: 'grey',
    values: [{
      title: defineMessage({ defaultMessage: 'Average Time To Connect' }),
      value: '554 ms'
    }],
    onClick: () => {}
  }
]

const data2: StatsCardProps[] = [
  {
    type: 'green',
    title: defineMessage({ defaultMessage: 'Utilization' }),
    values: [{
      title: defineMessage({ defaultMessage: 'Clients/AP' }),
      value: '5'
    },
    {
      title: defineMessage({ defaultMessage: 'Switch Ports in use' }),
      value: '10',
      suffix: '/100'
    }]
  },
  {
    type: 'red',
    title: defineMessage({ defaultMessage: 'Incidents By' }),
    values: [{
      title: defineMessage({ defaultMessage: 'APs' }),
      value: '237'
    },
    {
      title: defineMessage({ defaultMessage: 'Switches' }),
      value: '15'
    }]
  },
  {
    type: 'yellow',
    title: defineMessage({ defaultMessage: 'Total Traffic' }),
    values: [{
      title: defineMessage({ defaultMessage: 'APs' }),
      value: '450 TB'
    },
    {
      title: defineMessage({ defaultMessage: 'Switches' }),
      value: '227 TB'
    }]
  },
  {
    type: 'grey',
    title: defineMessage({ defaultMessage: 'PoE' }),
    values: [{
      title: defineMessage({ defaultMessage: 'Wireless' }),
      value: 'X%'
    },
    {
      title: defineMessage({ defaultMessage: 'Wired' }),
      value: 'Y1'
    }]
  }
]

const onlyWirelessData = data2.map(item => {
  return {
    ...item,
    values: item.values.filter((value, index) => index !== 1)
  }
})

storiesOf('StatsCard', module)
  .add('With link',
    () => <GridRow>
      {data1.map((stat)=>
        <GridCol key={stat.type} col={{ span: 24/data1.length }}>
          <StatsCard {...stat} />
        </GridCol>
      )}
    </GridRow>)
  .add('Without link, 2 values and divider',
    () => <GridRow>
      {data2.map((stat)=>
        <GridCol key={stat.type} col={{ span: 24/data1.length }}>
          <StatsCard {...stat} />
        </GridCol>
      )}
    </GridRow>)
  .add('With title, 1 value and no link',
    () => <GridRow>
      {onlyWirelessData.map((stat)=>
        <GridCol key={stat.type} col={{ span: 24/data1.length }}>
          <StatsCard {...stat} />
        </GridCol>
      )}
    </GridRow>)
