import React from 'react'

import { DropDown } from '@acx-ui/components'

import { HeaderDropDownWrapper, Divider, RegionIcon } from './styledComponents'

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
      <RegionIcon />
      <DropDown list={list} selected={selected} />
    </HeaderDropDownWrapper>
  )
}

export default HeaderDropDown
