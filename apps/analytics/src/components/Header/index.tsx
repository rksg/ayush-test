import React from 'react'

import { Divider } from 'antd'

import { useGlobalFilter }  from '@acx-ui/analytics/utils'

import { PageHeader, PageHeaderProps, Button } from '@acx-ui/components'

type Subtitle = {
  key: string,
  value: string[]
}

type HeaderProps = PageHeaderProps & { subTitles: Subtitle[] }

export const getSubtitle = (subTitles: Subtitle[]) => {
  return (<>{subTitles.map(({ key, value }, index) => (
    <span key={key} title={value.join(', ')}>
      {key}: {value.length > 1 ? `${value[0]}(${value.length})` : `${value[0]}`}
      {index < subTitles.length - 1 && <Divider type='vertical' />}
    </span>)
  )}
  </>)
}
export const Header = ({ subTitles, ...otherProps }: HeaderProps) => {
  const props = { 
    ...otherProps,
    subTitle: getSubtitle(subTitles),
    extra: [
      <Button key='hierarchy-filter'>network filter</Button>,
      <Button key='date-filter'>date filter</Button>
    ]
  }
  return (
    <PageHeader {...props}/>
  )
}

export default (props: PageHeaderProps) => {
  const filters = useGlobalFilter()
  // const queryResults = useTrafficByVolumeQuery(filters)
  console.log(filters)
  return <Header {...props} subTitles={[]} />
}
