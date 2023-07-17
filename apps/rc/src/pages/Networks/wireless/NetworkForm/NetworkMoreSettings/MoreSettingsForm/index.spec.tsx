import React from 'react'

import { Form } from 'antd'

import { BasicServiceSetPriorityEnum, NetworkSaveData, OpenWlanAdvancedCustomization } from '@acx-ui/rc/utils'
import { Provider }                                                                    from '@acx-ui/store'
import { render, screen }                                                              from '@acx-ui/test-utils'

import MoreSettingsForm from '.'


const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    advancedCustomization: {
      bssPriority: BasicServiceSetPriorityEnum.LOW
    } as OpenWlanAdvancedCustomization
  }
} as NetworkSaveData

describe('MoreSettingsForm', () => {
  it('should renders the TabSwitcher and BodyOfMoreSettingsForm components', () => {
    // GIVEN
    // WHEN
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>
    )

    // THEN
    // expect(screen.getByTestId('TabSwitcher')).toBeInTheDocument()
    expect(screen.getByTestId('BodyOfMoreSettingsForm')).toBeInTheDocument()
  })
})
