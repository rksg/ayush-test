import { FC, ReactNode, useState } from 'react'

import { Space } from 'antd'

import { SelectionControl, SelectionControlOptionProps } from '../SelectionControl'

export interface TabDetail {
  label: string
  value: string
  children: ReactNode,
  icon?: ReactNode
}

export interface TabsProps {
  defaultValue?:string
  tabDetails : Array<TabDetail>
  size?: 'small' | 'middle' | 'large'
  align?: 'left' | 'right' | 'center'
}

export const Tabs: FC<TabsProps> = (props) => {
  const { tabDetails, defaultValue, size, align } = props

  const options: SelectionControlOptionProps[] = tabDetails.map(tabDetail=>{
    return {
      label: tabDetail.label,
      value: tabDetail.value,
      icon: tabDetail.icon
    }
  })
  const [activeContent, setActiveContent] = useState(defaultValue || options[0].value)
  return(
    <>
      <Space style={{ justifyContent: align, padding: '15px 0px' }}>
        <SelectionControl options={options}
          defaultValue={defaultValue || options[0].value}
          size={size}
          onChange={(e) => {
            setActiveContent(e.target.value)
          }} />
      </Space>
      {
        tabDetails.find((tabDetail) => tabDetail.value === activeContent)?.children
      }
    </>
  )
}

Tabs.defaultProps={
  size: 'small',
  align: 'center'
}
