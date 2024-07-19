import React from 'react'

interface PortalViewTextProps {
  value: string | undefined
  id: string
}
export default function PortalViewText (props: PortalViewTextProps){
  const { value = '', id } = props
  const displayText = value.split('\n').map((text, index) => (
    <React.Fragment key={`${id}_${index}`}>
      {index > 0 && <br /> }{text}
    </React.Fragment>
  ))
  return <> {displayText} </>
}