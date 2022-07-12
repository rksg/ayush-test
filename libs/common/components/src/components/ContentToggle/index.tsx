import { FC, ReactNode, useState } from 'react'

import { SelectionControl, SelectionControlOptionProps } from '../SelectionControl'

export interface TabDetail {
  label: string
  value: string
  content: ReactNode,
  icon?: ReactNode
}

export interface ContentToggleProps{
  defaultValue?:string
  tabDetails : [TabDetail,TabDetail]
  size?: 'small' | 'middle' | 'large'
}

export const ContentToggle: FC<ContentToggleProps> = (props) => {
  const { tabDetails, defaultValue, size } = props
  
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
      <div style={{ textAlign: 'center' }}>
        <SelectionControl options={options}
          defaultValue={defaultValue || options[0].value}
          size={size}
          onChange={(e) => {
            setActiveContent(e.target.value)
          }} />
      </div>
      <div>
        {tabDetails.find((tabDetail) => tabDetail.value === activeContent)?.content}
      </div>
    </>
  )
}

ContentToggle.defaultProps={
  size: 'small'
}
