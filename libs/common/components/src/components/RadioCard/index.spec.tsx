import { defineMessage } from 'react-intl'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { RadioCard, RadioCardCategory as Category } from '.'

describe('RadioCard', () => {
  describe('type = default', () => {
    it('should render', async () => {
      render(<RadioCard
        value='value'
        title='title'
        description='description'
        categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
      />)
      await screen.findByText('title')
      await screen.findByText('description')
      await screen.findByText('Wi-Fi')
    })
    it('should handle onClick', async () => {
      const onClick = jest.fn()
      render(<RadioCard
        value='value'
        title='title'
        description='description'
        onClick={onClick}
      />)
      fireEvent.click(await screen.findByText('title'))
      expect(onClick).toBeCalledTimes(1)
    })
  })
  describe('type = radio', () => {
    it('should render', async () => {
      render(<RadioCard
        type='radio'
        value='value'
        title='title'
        description='description'
        categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
      />)
      await screen.findByText('title')
      await screen.findByText('description')
      await screen.findByText('Wi-Fi')
      await screen.findByDisplayValue('value')
    })
    it('should not call onClick', async () => {
      const onClick = jest.fn()
      render(<RadioCard
        type='radio'
        value='value'
        title='title'
        description='description'
      />)
      fireEvent.click(await screen.findByText('title'))
      expect(onClick).not.toBeCalled()
    })
  })
  describe('type = button', () => {
    it('should render', async () => {
      render(<RadioCard
        type='button'
        value='value'
        title='title'
        description='description'
        categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
        buttonText={defineMessage({ defaultMessage: 'Add' })}
      />)
      await screen.findByText('title')
      await screen.findByText('description')
      await screen.findByText('Wi-Fi')
      await screen.findByText('Add')
    })
    it('should handle button onClick', async () => {
      const onClick = jest.fn()
      render(<RadioCard
        type='button'
        value='value'
        title='title'
        description='description'
        buttonText={defineMessage({ defaultMessage: 'Add' })}
        onClick={onClick}
      />)
      fireEvent.click(await screen.findByText('Add'))
      expect(onClick).toBeCalledTimes(1)
    })
  })
  describe('type = disabled', () => {
    it('should render', async () => {
      render(<RadioCard
        type='disabled'
        value='value'
        title='title'
        description='description'
        categories={[Category.WIFI, Category.SWITCH, Category.EDGE]}
      />)
      await screen.findByText('title')
      await screen.findByText('description')
      await screen.findByText('Wi-Fi')
    })
    it('should handle onClick', async () => {
      const onClick = jest.fn()
      render(<RadioCard
        type='disabled'
        value='value'
        title='title'
        description='description'
        onClick={onClick}
      />)
      fireEvent.click(await screen.findByText('title'))
      expect(onClick).not.toBeCalled()
    })
  })
})