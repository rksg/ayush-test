import { baseUrlFor } from '@acx-ui/config'

import * as UI from './styledComponents'

const PoweredLogo = baseUrlFor('/assets/images/portal/PoweredLogo.png')

export function PoweredByContent () {
  return (
    <UI.SelectedDiv style={{}}>
      <div placeholder='poweredbackground'>
        <UI.FieldText
          placeholder='poweredtext'
          style={{
            marginBottom: -30,
            marginLeft: -120,
            fontSize: 12
          }}
        >
          {'Powered By'}
        </UI.FieldText>
        <UI.Img
          src={PoweredLogo}
          alt={'poweredimage'}
          style={{
            marginLeft: 50,
            maxWidth: 425,
            height: 70
          }}
        ></UI.Img>
      </div>
    </UI.SelectedDiv>
  )
}
