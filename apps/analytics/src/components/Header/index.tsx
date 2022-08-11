import React from 'react'

import { useAnalyticsFilter }                           from '@acx-ui/analytics/utils'
import { PageHeader, PageHeaderProps , Button, Loader } from '@acx-ui/components'

import { useNetworkNodeInfoQuery } from './services'
import { Divider }                 from './styledComponents'

export type SubTitle = {
  key: string,
  value: (number | string)[]
}

export type HeaderData = {
  title: string,
  subTitle: SubTitle[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> &
  { data: HeaderData } & { replaceTitle: boolean }

export const getSubTitle = (subTitles: SubTitle[]) => {
  return (<>{subTitles.map(({ key, value }, index) => (
    <span key={key} title={value.join(', ')}>
      {key}: {value.length > 1 ? `${value[0]} (${value.length})` : `${value[0]}`}
      {index < subTitles.length - 1 && <Divider key={key} type='vertical' />}
    </span>)
  )}
  </>)
}
export const Header = ({ data, replaceTitle, ...otherProps }: HeaderProps) => {
  const { title, subTitle } = data
  const props = { ...otherProps, subTitle: getSubTitle(subTitle) }
  if (replaceTitle) props.title = title
  return (
    <PageHeader {...props}
      extra={[
        <Button key='hierarchy-filter'>network filter</Button>,
        <Button key='date-filter'>date filter</Button>
      ]}/>
  )
}

const ConnectedHeader = (props: PageHeaderProps) => {
  const filters = useAnalyticsFilter()
  const queryResults = useNetworkNodeInfoQuery(filters)
  return <div>
    <Loader states={[queryResults]}>
      <Header {...props}
        data={queryResults.data as HeaderData}
        replaceTitle={filters.path.length > 1}
      />
    </Loader>
  </div>
}

export default ConnectedHeader
