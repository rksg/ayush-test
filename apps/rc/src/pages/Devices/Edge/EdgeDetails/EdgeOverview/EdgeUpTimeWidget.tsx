import { Typography, Card as AntCard, Space } from 'antd'
import { useIntl }                            from 'react-intl'
// import AutoSizer                              from 'react-virtualized-auto-sizer'
import styled from 'styled-components'

import {
  Loader,
  NoData,
  Subtitle
} from '@acx-ui/components'
import {
  SpaceWrapper
} from '@acx-ui/rc/components'
// import { formatter } from '@acx-ui/utils'


const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  .ant-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    padding: 12px 16px;
    border: 1px solid var(--acx-neutrals-20);
    box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
  }
  .ant-card-head {
    padding: 0;
    border-bottom: none;
    min-height: 0;
    margin-bottom: 10px;
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
            <SpaceWrapper>
              <Typography.Title level={5}>
                {$t({ defaultMessage: 'Total Uptime:' })}
              </Typography.Title>
              <Subtitle level={5}>22h 15m</Subtitle>
              <Typography.Title level={4}>
                {$t({ defaultMessage: 'Total Downtime:' })}
              </Typography.Title>
              <Subtitle level={4}>1h</Subtitle>
            </SpaceWrapper>
          }
        >
          <NoData/>
        </AntCard>
      </Wrapper>
    </Loader>

  )
}
