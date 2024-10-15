import userEvent from '@testing-library/user-event'

import { UIConfiguration }           from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { LogoContent } from './LogoContent'


const config: UIConfiguration = {
  disablePoweredBy: false,
  uiColorSchema: {
    fontHeaderColor: 'var(--acx-neutrals-100)',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: 'var(--acx-neutrals-100)',

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


describe('LogoContent', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <LogoContent value={config} onDisabled={()=>{}} onLogoChange={()=>{}} onSizeChange={()=>{}}/>
    </Provider>)
    const logo = await screen.findByAltText('logo')
    await fireEvent.mouseOver(logo)
    await fireEvent.mouseLeave(logo)
    await userEvent.hover(logo)
    await userEvent.click(logo)
  })
})