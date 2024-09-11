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


describe('BodyContent', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <BodyContent value={config} onColorChange={()=>{}}/>
    </Provider>)
    await screen.findByText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
    const body = await screen.findByPlaceholderText('bodytext')
    await fireEvent.mouseOver(body)
    await fireEvent.mouseLeave(body)
    await userEvent.hover(body)
    await userEvent.click(body)
  })
})