/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { useState } from 'react'

import { AAAServerTypeEnum, RadiusServer } from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { render }                          from '@acx-ui/test-utils'

import { AAAServerDrawer } from './AAAServerDrawer'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

const TestComponent = (props: { isEditMode: boolean }) => {
  const { isEditMode } = props
  const [visibleAdd, setVisibleAdd] = useState(true)

  return <AAAServerDrawer
    visible={visibleAdd}
    setVisible={setVisibleAdd}
    isEditMode={isEditMode}
    serverType={AAAServerTypeEnum.RADIUS}
    editData={{} as RadiusServer}
  />
}

describe('AAAServerDrawer', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><TestComponent isEditMode={false} /></Provider>,
      { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
