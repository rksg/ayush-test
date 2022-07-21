import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { ToggleButtonInput } from '.'

describe('ToggleButtonInput true', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <ToggleButtonInput
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render true status correctly', () => {
    const { asFragment } = render(
      <ToggleButtonInput
        value={true}
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render false status correctly', () => {
    const { asFragment } = render(
      <ToggleButtonInput
        value={false}
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should trigger onChange event correctly', async () => {
    const { asFragment } = render(
      <ToggleButtonInput
        enableText='Remove Secondary Server'
        disableText='Add Secondary Server'
      />)
    const link = await screen.findByText('Add Secondary Server')
    fireEvent.click(link)
    expect(asFragment()).toMatchSnapshot()
  })
})