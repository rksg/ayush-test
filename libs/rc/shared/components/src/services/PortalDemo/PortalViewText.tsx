import React from 'react'

export default function PortalViewText (props: { value: string|undefined, id: string }) {
  const displayText = props.value?.split('\n').map((text, index) => (
    <React.Fragment key={`${props.id}_${index}`}>
      {text}
      <br />
    </React.Fragment>
  ))

  return <div>{displayText ?? ''}</div>
}