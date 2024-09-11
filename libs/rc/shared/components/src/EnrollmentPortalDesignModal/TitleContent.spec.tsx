import userEvent from '@testing-library/user-event'

import { UIConfiguration }           from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { TitleContent } from './TitleContent'


const config: UIConfiguration = {
  disablePoweredBy: false,
  uiColorSchema: {
    fontHeaderColor: '#123411',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: 'var(--acx-neutrals-100)',

    buttonFontColor: 'var(--acx-primary-white)',
    buttonColor: 'var(--acx-accents-orange-50)'
  },
  uiStyleSchema: {
    logoRatio: 1,
    titleFontSize: 16,
    logoImageFileName: 'logo',
    backgroundImageName: 'bgImage'
  },
  welcomeName: '',
  welcomeTitle: ''
}


describe('Title Content', () => {
  it('should render correctly', async () => {
    const democontent = document.createElement('div')
    democontent.id = 'democontent'
    document.body.appendChild(democontent)


    render(<Provider>
      <TitleContent value={config} onColorChange={()=>{}} onSizeChange={()=>{}}/>
    </Provider>)

    await screen.findByText('Title text style')
    const body = await screen.findByPlaceholderText('titletext')
    await fireEvent.mouseOver(body)
    await fireEvent.mouseLeave(body)
    await userEvent.hover(body)
    await userEvent.click(body)

    // Check Tooltip icons
    expect(screen.getByTestId('BrushSolid')).toBeInTheDocument()
    expect(screen.getByTestId('TextMinus')).toBeInTheDocument()
    expect(screen.getByTestId('TextPlus')).toBeInTheDocument()

    const colorButton = screen.getByTestId('BrushSolid')
    await userEvent.click(colorButton)
    expect(screen.getByPlaceholderText(/colorpickcontainer/i)).toBeInTheDocument()

    const colorField = await screen.findByLabelText('hex')
    expect(colorField).toHaveValue(config.uiColorSchema.fontHeaderColor.replace('#', ''))

    await userEvent.clear(colorField)
    await userEvent.type(colorField, '888888')
    await userEvent.unhover(colorField) // to trigger `onChangeComplete`
    expect(colorField).toHaveValue('888888')
  })
})