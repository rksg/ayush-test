import React from 'react'


import { PageHeader }      from '@acx-ui/components'


type BaseProps = {
  title: string,
  breadCrumb: BreadCrumb[]
}
type BreadCrumb = {
  text: string,
  link: string
}
type SubTitle = {
  key: string,
  value: string[]
}
type SubTitleProps = {
  subTitle: SubTitle[]
}
type HeaderProps = BaseProps & SubTitleProps

export const getSubTitle = ({ subTitle }: SubTitleProps) => {
  return (<>{subTitle.map(({ key, value }, index) => (
    <span key={key} title={value.join(', ')}>
      {key}: {value.length > 1 ? `${value[0]}(${value.length})` : `${value[0]}`}
      {index < subTitle.length - 1 && '  |  '}
    </span>)
  )}
  </>)
}
export const Header = ({ title, subTitle, breadCrumb }: HeaderProps) => {
  return (
    <PageHeader
      breadcrumb={breadCrumb}
      title={title}
      footer={getSubTitle({ subTitle })}
    />
  )
}
