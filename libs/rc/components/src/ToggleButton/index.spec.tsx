import '@testing-library/jest-dom'
import { useState } from 'react'

import { render, screen, fireEvent } from '@testing-library/react'

import { ToggleButton } from '.'

describe('ToggleButtonInput true', () => {
  const texts = {
    enableText: 'Remove Secondary Server',
    disableText: 'Add Secondary Server'
  }
  describe('uncontrolled', () => {
    it('default to show disableText', () => {
      render(<ToggleButton {...texts} />)
      expect(screen.getByText(texts.disableText)).toBeVisible()
    })
    it('should trigger onChange event correctly', async () => {
      const onChange = jest.fn()
      render(<ToggleButton {...texts} onChange={onChange} />)

      fireEvent.click(await screen.findByRole('button'))
      expect(screen.getByText(texts.enableText)).toBeVisible()
      expect(onChange).toHaveBeenCalledWith(true)

      fireEvent.click(await screen.findByRole('button'))
      expect(screen.getByText(texts.disableText)).toBeVisible()
      expect(onChange).toHaveBeenCalledWith(false)
    })
  })
  describe('controlled', () => {
    it('shows enabledText when value = true', () => {
      render(<ToggleButton {...texts} value={true} />)
      expect(screen.getByText(texts.enableText)).toBeVisible()
    })
    it('shows disableText when value = false', () => {
      render(<ToggleButton {...texts} value={false} />)
      expect(screen.getByText(texts.disableText)).toBeVisible()
    })

    it('should trigger onChange event and does not change value', async () => {
      const onChange = jest.fn()
      render(<ToggleButton {...texts} onChange={onChange} value={false} />)

      fireEvent.click(await screen.findByRole('button'))
      expect(screen.getByText(texts.disableText)).toBeVisible()
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('handles value update from external controlled value', async () => {
      const Component = () => {
        const [value, setValue] = useState(false)
        return <>
          <ToggleButton {...texts} onChange={setValue} value={value} />
          <span>state: {String(value)}</span>
        </>
      }
      render(<Component />)

      expect(await screen.findByText(texts.disableText)).toBeVisible()
      expect(await screen.findByText('state: false')).toBeVisible()

      fireEvent.click(await screen.findByRole('button'))

      expect(await screen.findByText(texts.enableText)).toBeVisible()
      expect(await screen.findByText('state: true')).toBeVisible()
    })
  })

  it('ignore value become controlled if it started as uncontrolled', async () => {
    const Component = () => {
      const [value, setValue] = useState<boolean | undefined>(undefined)
      return <ToggleButton
        {...texts}
        onChange={setValue}
        value={value !== undefined ? false : value}
      />
    }
    render(<Component />)

    expect(await screen.findByText(texts.disableText)).toBeVisible()
    fireEvent.click(await screen.findByRole('button'))
    expect(await screen.findByText(texts.enableText)).toBeVisible()
  })

  it('ignore value become uncontrolled if it started as controlled', async () => {
    const Component = () => {
      const [value, setValue] = useState<boolean | undefined>(true)
      return <ToggleButton
        {...texts}
        onChange={setValue}
        value={value === false ? undefined : value}
      />
    }
    render(<Component />)

    expect(await screen.findByText(texts.enableText)).toBeVisible()
    fireEvent.click(await screen.findByRole('button'))
    expect(await screen.findByText(texts.enableText)).toBeVisible()
  })
})
