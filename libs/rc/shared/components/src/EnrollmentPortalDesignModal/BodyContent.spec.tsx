import userEvent from '@testing-library/user-event'

import { UIConfiguration }           from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { BodyContent } from './BodyContent'


const config: UIConfiguration = {
  disablePoweredBy: false,
  uiColorSchema: {
    fontHeaderColor: 'var(--acx-neutrals-100)',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: '#122222',

    buttonFontColor: 'var(--acx-primary-white)',
    buttonColor: 'var(--acx-accents-orange-50)'
  },
  uiStyleSchema: {
    logoSize: 'MEDIUM',
    headerFontSize: 16,
    logoImageFileName: 'logo',
    backgroundImageName: 'bgImage'
  },
  welcomeName: '',
  welcomeTitle: ''
}


describe('BodyContent', () => {
  it('should render correctly', async () => {
    const democontent = document.createElement('div')
    democontent.id = 'democontent'
    document.body.appendChild(democontent)
    render(<Provider>
      <BodyContent value={config} onColorChange={()=>{}}/>
    </Provider>)
    await screen.findByText('Body text style')
    const body = await screen.findByPlaceholderText('bodytext')
    await fireEvent.mouseOver(body)
    await fireEvent.mouseLeave(body)
    await userEvent.hover(body)
    await userEvent.click(body)
    // Check Tooltip icons
    expect(screen.getByTestId('BrushSolid')).toBeInTheDocument()

    const colorButton = screen.getByTestId('BrushSolid')
    await userEvent.click(colorButton)
    expect(screen.getByPlaceholderText(/colorpickcontainer/i)).toBeInTheDocument()

    const colorField = await screen.findByLabelText('hex')
    expect(colorField).toHaveValue(config.uiColorSchema.fontColor.replace('#', ''))

    await userEvent.clear(colorField)
    await userEvent.type(colorField, '888888')
    await userEvent.unhover(colorField) // to trigger `onChangeComplete`
    expect(colorField).toHaveValue('888888')
  })
})