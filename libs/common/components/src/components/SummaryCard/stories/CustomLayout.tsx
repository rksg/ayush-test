import { Divider } from 'antd'

import { SummaryCard } from '..'

export const CustomLayout = () => (<SummaryCard>
  <SummaryCard.Item title='title1' content='content1' />
  <Divider />
  <SummaryCard.Item title='title2' content='content2' />
  <Divider />
  <SummaryCard.Item title='title3' content='content3' />
</SummaryCard>)