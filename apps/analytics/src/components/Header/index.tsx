import React from 'react'

import { PageHeader, PageHeaderProps , Button } from '@acx-ui/components'

import { Divider } from './styledComponents'

type SubTitle = {
  key: string,
  value: string[]
}

type HeaderProps = Omit<PageHeaderProps, 'subTitle'> & { subTitles: SubTitle[] }

export const getSubTitle = (subTitles: SubTitle[]) => {
  return (<>{subTitles.map(({ key, value }, index) => (
    <span key={key} title={value.join(', ')}>
      {key}: {value.length > 1 ? `${value[0]} (${value.length})` : `${value[0]}`}
      {index < subTitles.length - 1 && <Divider type='vertical' />}
    </span>)
  )}
  </>)
}
export const Header = ({ subTitles, ...otherProps }: HeaderProps) => {
  const props = { ...otherProps, subTitle: getSubTitle(subTitles) }
  return (
    <PageHeader {...props}/>
  )
}
