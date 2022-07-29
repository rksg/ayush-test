import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { ToggleButton } from '.'

describe('ToggleButtonInput true', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <ToggleButton
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render true status correctly', () => {
    const { asFragment } = render(
      <ToggleButton
        value={true}
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render false status correctly', () => {
    const { asFragment } = render(
      <ToggleButton
        value={false}
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should trigger onChange event correctly', async () => {
    const { asFragment } = render(
      <ToggleButton
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    const link = await screen.findByText('Add Secondary Server')
    fireEvent.click(link)
    expect(asFragment()).toMatchSnapshot()
  })
})