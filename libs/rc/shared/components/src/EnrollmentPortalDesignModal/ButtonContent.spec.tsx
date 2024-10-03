import userEvent from '@testing-library/user-event'

import { UIConfiguration } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'

import { ButtonContent } from './ButtonContent'

const expectedColor = '#111222'
const defaultUIConfiguration: UIConfiguration = {
  disablePoweredBy: false,
  uiColorSchema: {
    fontHeaderColor: expectedColor,
    fontColor: expectedColor,
    backgroundColor: expectedColor,
    buttonColor: expectedColor,
    buttonFontColor: expectedColor
  },
  uiStyleSchema: {
    logoSize: 'MEDIUM',
    headerFontSize: 16
  },
  welcomeTitle: 'welcomeTitle',
  welcomeName: 'welcomeName'
}

describe('ButtonContent', () => {
  it('should render ButtonContent popover tooltip correctly', async () => {
    const democontent = document.createElement('div')
    democontent.id = 'democontent'
    document.body.appendChild(democontent)

    render( <Provider>
      <ButtonContent
        value={defaultUIConfiguration}
        onButtonColorChange={() =>{}}
        onFontColorChange={() =>{}}
      />
    </Provider>)

    const targetBtn = await screen.findByRole('button', { name: /button style/i })
    expect(targetBtn).toBeInTheDocument()
    await userEvent.click(targetBtn)

    // Check Tooltip icons
    expect(screen.getByTestId('BrushSolid')).toBeInTheDocument()
    expect(screen.getByTestId('TextColor')).toBeInTheDocument()
  })

  it('should change via tooltip correctly', async () => {
    const democontent = document.createElement('div')
    democontent.id = 'democontent'
    document.body.appendChild(democontent)

    render( <Provider>
      <ButtonContent
        value={defaultUIConfiguration}
        onButtonColorChange={() =>{}}
        onFontColorChange={() =>{}}
      />
    </Provider>)

    const targetBtn = await screen.findByRole('button', { name: /button style/i })
    expect(targetBtn).toBeInTheDocument()
    await userEvent.click(targetBtn)

    const backgroundBtn = screen.getByTestId('BrushSolid')
    const textBtn = screen.getByTestId('TextColor')

    await userEvent.click(backgroundBtn)
    expect(screen.getByPlaceholderText(/colorpickcontainer/i)).toBeInTheDocument()

    const colorField = await screen.findByLabelText('hex')
    expect(colorField).toHaveValue(expectedColor.replace('#', ''))

    await userEvent.clear(colorField)
    await userEvent.type(colorField, '888888')
    await userEvent.unhover(colorField) // to trigger `onChangeComplete`
    expect(colorField).toHaveValue('888888')

    // Click again will close the original one
    await userEvent.click(textBtn)
    expect(screen.queryByPlaceholderText(/colorpickcontainer/i)).toBeNull()

    await userEvent.click(textBtn)
    expect(screen.getByPlaceholderText(/colorpickcontainer/i)).toBeInTheDocument()

    // Click again will close the original one
    await userEvent.click(backgroundBtn)
    expect(screen.queryByPlaceholderText(/colorpickcontainer/i)).toBeNull()
  })

})