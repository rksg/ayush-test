import userEvent from '@testing-library/user-event'

import { UIConfiguration } from '@acx-ui/rc/utils'
import { Provider }        from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'

import { BackgroundContent } from './BackgroundContent'


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
    logoRatio: 1,
    titleFontSize: 16,
    logoImageFileName: 'logo',
    backgroundImageName: 'bgImage'
  },
  welcomeName: '',
  welcomeTitle: ''
}


describe('BackgroundContent', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <BackgroundContent value={config} $isDesk onColorChange={()=>{}} onImageChange={()=>{}}/>
    </Provider>)
    const settings = await screen.findByTitle('background setting')
    await userEvent.hover(settings)
    await userEvent.click(settings)
  })
})