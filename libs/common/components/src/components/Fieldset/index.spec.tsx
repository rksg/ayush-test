import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { Fieldset, FieldsetProps } from '.'

describe('Fieldset', () => {
  describe('controlled', () => {
    it('hides children when unchecked', async () => {
      const Component = (props: Partial<FieldsetProps>) => {
        const [checked, setChecked] = useState(props.checked ?? false)

        return <Fieldset
          label='Fieldset Title'
          checked={checked}
          onChange={(checked) => {
            props.onChange?.(checked)
            setChecked(props.checked === undefined ? checked : props.checked)
          }}
          children={<div data-testid='fieldset-content' />}
        />
      }
      const onChange = jest.fn()
      render(<Component onChange={onChange} />)

      expect(screen.getByRole('group', { name: 'Fieldset Title' })).toBeVisible()

      expect(screen.queryByTestId('fieldset-content')).toBeNull()
      await userEvent.click(screen.getByRole('switch'))
      expect(screen.queryByTestId('fieldset-content')).toBeVisible()

      expect(onChange).toBeCalledWith(true)
    })
    it('does not change checked state if outer state not changed', async () => {
      render(<Fieldset checked
        label='Fieldset Title'
        children={<div data-testid='fieldset-content' />}
      />)

      const toggle = screen.getByRole('switch')

      expect(toggle).toBeChecked()
      await userEvent.click(toggle)
      expect(toggle).toBeChecked()
    })
    it('prevent change from controlled to uncontrolled', async () => {
      const props = {
        label: 'Fieldset Title',
        children: <div data-testid='fieldset-content' />
      }
      const { rerender } = render(<Fieldset {...props} checked />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()

      rerender(<Fieldset {...props} checked={undefined} />)
      expect(toggle).toBeChecked()
    })
  })
  describe('uncontrolled', () => {
    it('hides children when unchecked', async () => {
      const onChange = jest.fn()
      render(<Fieldset
        label='Fieldset Title'
        onChange={onChange}
        children={<div data-testid='fieldset-content' />}
      />)

      expect(screen.getByRole('group', { name: 'Fieldset Title' })).toBeVisible()

      expect(screen.queryByTestId('fieldset-content')).toBeNull()
      await userEvent.click(screen.getByRole('switch'))
      expect(screen.queryByTestId('fieldset-content')).toBeVisible()

      expect(onChange).toBeCalledWith(true)
    })
  })
})
