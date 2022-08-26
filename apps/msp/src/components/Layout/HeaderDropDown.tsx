import React from 'react'

import { DropDown } from '@acx-ui/components'

import { HeaderDropDownWrapper, Divider, RocketIcon } from './styledComponents'

function HeaderDropDown ({
  list,
  selected
}: {
  list: string[];
  selected: string;
}) {
  return (
    <HeaderDropDownWrapper>
      <Divider />
      <RocketIcon />
      <DropDown list={list} selected={selected} />
    </HeaderDropDownWrapper>
  )
}

export default HeaderDropDown
