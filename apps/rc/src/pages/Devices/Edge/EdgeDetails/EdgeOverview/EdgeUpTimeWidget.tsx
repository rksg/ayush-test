import { Typography, Card as AntCard, Space } from 'antd'
import { useIntl }                            from 'react-intl'
// import AutoSizer                              from 'react-virtualized-auto-sizer'
import styled from 'styled-components'

import {
  Loader,
  NoData,
  Subtitle
} from '@acx-ui/components'
// import { formatter } from '@acx-ui/formatter'
import {
  SpaceWrapper
} from '@acx-ui/rc/components'

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  .ant-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
  }
  .ant-card-head {
    padding: 0;
    border-bottom: none;
    min-height: 0;
  }
  .ant-card-head-title {
    padding: 0;
  }
  .ant-card-head-wrapper {
    align-items: start;
  }
  .ant-card-extra {
    padding: 0;
  }
  .ant-card-body {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 0;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
  .cardTitle {
    font-family: var(--acx-accent-brand-font);
    font-size: var(--acx-headline-4-font-size);
    line-height: var(--acx-headline-4-line-height);
    color: var(--acx-primary-black);
    font-weight: var(--acx-headline-4-font-weight-bold);
    height: var(--acx-headline-4-line-height);
  }
`

export const EdgeUpTimeWidget = () => {
  const { $t } = useIntl()

  // TODO: wait for API, use fake data for testing
  const queryResults = { data: [], isLoading: false }

  return (
    <Loader states={[queryResults]}>
      <Wrapper>
        <AntCard
          bordered={false}
          title={
            <Space size={4} className='cardTitle'>
              {$t({ defaultMessage: 'SmartEdge Status' })}
            </Space>
          }
          extra={
            <SpaceWrapper full>
              <Typography.Title level={5}>
                {$t({ defaultMessage: 'Total Uptime:' })}
              </Typography.Title>
              {/* TODO: wait for API. */}
              <Subtitle level={5}>22h 15m</Subtitle>
              <Typography.Title level={4}>
                {$t({ defaultMessage: 'Total Downtime:' })}
              </Typography.Title>
              {/* TODO: wait for API. */}
              <Subtitle level={4}>1h</Subtitle>
            </SpaceWrapper>
          }
        >
          <NoData/>

          {/* TODO: wait for API. */}
          {/* TODO: need "xAxis.show" can be configurable */}
          {/*
            <StackedBarChart
              style={{ height: 40, width: '100%' }}
              data={[
                {
                  category: 'uptime',
                  // eslint-disable-next-line max-len
                  series: [
                    { name: '2018-08-15T10:04:01.339Z', value: 60 },
                    { name: '2018-08-15T11:04:01.339Z', value: 30 },
                    { name: '2018-08-15T11:34:01.339Z', value: 1 },
                    { name: '2018-08-15T11:35:01.339Z', value: 30 },
                  ],
                  // series: data.uptime
                },
              ]}
              showTooltip={false}
              showLabels={false}
              showTotal={false}
              // eslint-disable-next-line max-len
              barColors={[
                cssStr('--acx-semantics-green-50'),
                cssStr('--acx-neutrals-20'),
                cssStr('--acx-semantics-green-50'),
                cssStr('--acx-neutrals-20'),
              ]}
            />
            */}
        </AntCard>
      </Wrapper>
    </Loader>

  )
}
