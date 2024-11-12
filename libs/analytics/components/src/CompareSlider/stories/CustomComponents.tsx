import { CSSProperties } from 'react'

const labelStyle: CSSProperties = {
  fontSize: '1.25rem',
  position: 'absolute',
  top: 0,
  padding: '1rem',
  color: 'white',
  border: '2px solid white',
  borderRadius: '.5rem',
  backdropFilter: 'blur(0.25rem) saturate(180%) contrast(80%) brightness(120%)',
  WebkitBackdropFilter: 'blur(0.25rem) saturate(180%) contrast(80%) brightness(120%)',
  transition: 'opacity 0.25s ease-in-out'
}

export const ComponentOne = () => {
  return (
    <div data-testid='custom-component-one'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'start'
      }}>
      <div style={labelStyle}>Left</div>
      <img
        // eslint-disable-next-line max-len
        src='https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/demo-images/seattle-space-needle-1.jpg'
        alt='ImageOne'
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}

export const ComponentTwo = () => {
  return (
    <div data-testid='custom-component-two'
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'end'
      }}>
      <div style={labelStyle}>Right</div>
      <img
        // eslint-disable-next-line max-len
        src='https://raw.githubusercontent.com/nerdyman/stuff/main/libs/react-compare-slider/demo-images/seattle-space-needle-2.jpg'
        alt='ImageTwo'
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  )
}