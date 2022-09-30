import React, { useState } from 'react'

import * as UI from './styledComponents'

export function DropDown ({ list, selected }: { list: string[]; selected: string }) {
  const [selectedItem, setSelectedItem] = useState(selected)
  const menu = (
    <UI.Menu onClick={({ key }) => setSelectedItem(list[parseInt(key, 10)])}>
      {list.map((account, index) => (
        <UI.MenuItem key={index}>{account}</UI.MenuItem>
      ))}
    </UI.Menu>
  )
  return (
    <UI.Dropdown overlay={menu} trigger={['click']}>
      <UI.DropDownContainer>
        {selectedItem}
        <UI.ArrowExpandIcon />
      </UI.DropDownContainer>
    </UI.Dropdown>
  )
}
