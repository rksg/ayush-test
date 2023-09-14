import '@testing-library/jest-dom'

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent                     from '@testing-library/user-event'
import { debounce }                  from 'lodash'
import { rest }                      from 'msw'
import { IntlProvider }              from 'react-intl'


import { StepsForm }      from '@acx-ui/components'
import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import { mockServer }     from '@acx-ui/test-utils'

import { SelectModelStep }   from './SelectModelStep'
import { TaggedPortsStep }   from './TaggedPortsStep'
import { UntaggedPortsStep } from './UntaggedPortsStep'
import VlanPortsContext      from './VlanPortsContext'
import { VlanPortsModal }    from './VlanPortsModal'


describe('VlanPortsModal', () => {
  /* eslint-disable max-len */
  const vlans = [{
    arpInspection: false,
    id: '545d08c0e7894501846455233ad60cc5',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    vlanId: 2,
    vlanName: 'vlan-01'
  }, {
    arpInspection: false,
    id: '1af3d29b5dcc46a5a20a651fda55e2df',
    igmpSnooping: 'none',
    ipv4DhcpSnooping: false,
    spanningTreePriority: 32768,
    spanningTreeProtocol: 'none',
    switchFamilyModels: [{
      id: '9874453239bc479fac68bc050d0cf729',
      model: 'ICX7550-24P',
      slots: [
        { slotNumber: 1, enable: true },
        { slotNumber: 3, enable: true, option: '2X40G' },
        { slotNumber: 2, enable: true, option: '2X40G' }
      ],
      taggedPorts: '1/2/2',
      untaggedPorts: '1/1/20,1/3/2'
    }, {
      id: '9874453239bc479fac68bc050d0cf730',
      model: 'ICX7850-48F',
      slots: [
        { slotNumber: 1, enable: true, option: '' },
        { slotNumber: 2, enable: true, option: '12X40/100G' },
        { slotNumber: 3, enable: true, option: '8X40/100G' }
      ]
    }],
    vlanId: 3,
    vlanName: 'vlan-02'
  }]

  const records = [{
    id: '9874453239bc479fac68bc050d0cf729',
    model: 'ICX7550-24P',
    slots: [
      { slotNumber: 1, enable: true, option: '' },
      { slotNumber: 3, enable: true, option: '2X40G' },
      { slotNumber: 2, enable: true, option: '2X40G' }
    ],
    taggedPorts: ['1/1/48'],
    title: '',
    untaggedPorts: ['1/1/44'],
    vlanConfigName: ''
  }]

  const vlanSettingValues = {
    enableSlot2: true,
    enableSlot3: true,
    enableSlot4: false,
    family: 'ICX7150',
    model: '48',
    selectedOptionOfSlot2: '2X1G',
    selectedOptionOfSlot3: '4X1/10G',
    selectedOptionOfSlot4: '',
    switchFamilyModels: {
      id: '',
      model: 'ICX7150-48',
      slots: [
        { slotNumber: 1, enable: true, option: '', slotPortInfo: '48X1G', portStatus: Array(48) },
        { slotNumber: 2, enable: true, option: '2X1G', slotPortInfo: '2X1G', portStatus: Array(2) },
        { slotNumber: 3, enable: true, option: '4X1/10G', slotPortInfo: '4X1/10G', portStatus: Array(4) }
      ],
      taggedPorts: ['1/1/28'],
      untaggedPorts: ['1/1/21', '1/1/40']
    }
  }
  /* eslint-enable */

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  afterEach(() => {
    //Modal.destroyAll()
  })

  it('should render correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await screen.findByText(/No model selected/i)

    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('C08P')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })

  it('should add ICX7150-24 model correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await screen.findByText(/Select family and model to be configured/i)

    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByTestId('untagged_module1_0'))
    await userEvent.click(await screen.findByTestId('untagged_module2_0'))
    await userEvent.click(await screen.findByTestId('untagged_module3_0'))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByTestId('tagged_module1_1'))
    await userEvent.click(await screen.findByTestId('tagged_module2_1'))
    await userEvent.click(await screen.findByTestId('tagged_module3_1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })


  it('should add ICX7150-24 model with drag and select untagged ports correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await screen.findByText(/Select family and model to be configured/i)

    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    const dst1 = await screen.findAllByTestId('untagged_module1_0')
    const src1 = await screen.findAllByTestId('untagged_module1_10')
    fireEvent.mouseDown(src1[0])
    fireEvent.mouseMove(dst1[0])
    debounce(() => {
      fireEvent.mouseUp(dst1[0])
    }, 100)

    const dst2 = await screen.findAllByTestId('untagged_module2_0')
    const src2 = await screen.findAllByTestId('untagged_module2_1')
    fireEvent.mouseDown(src2[0])
    fireEvent.mouseMove(dst2[0])
    debounce(() => {
      fireEvent.mouseUp(dst2[0])
    }, 100)

    const dst3 = await screen.findAllByTestId('untagged_module3_0')
    const src3 = await screen.findAllByTestId('untagged_module3_3')
    fireEvent.mouseDown(src3[0])
    fireEvent.mouseMove(dst3[0])
    debounce(() => {
      fireEvent.mouseUp(dst3[0])
    }, 100)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should add ICX7150-24 model with drag and select tagged ports correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await screen.findByText(/Select family and model to be configured/i)

    const family = await screen.findByText('ICX-7150')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    const dst1 = await screen.findAllByTestId('tagged_module1_0')
    const src1 = await screen.findAllByTestId('tagged_module1_10')
    fireEvent.mouseDown(src1[0])
    fireEvent.mouseMove(dst1[0])
    debounce(() => {
      fireEvent.mouseUp(dst1[0])
    }, 100)

    const dst2 = await screen.findAllByTestId('tagged_module2_0')
    const src2 = await screen.findAllByTestId('tagged_module2_1')
    fireEvent.mouseDown(src2[0])
    fireEvent.mouseMove(dst2[0])
    debounce(() => {
      fireEvent.mouseUp(dst2[0])
    }, 100)

    const dst3 = await screen.findAllByTestId('tagged_module3_0')
    const src3 = await screen.findAllByTestId('tagged_module3_3')
    fireEvent.mouseDown(src3[0])
    fireEvent.mouseMove(dst3[0])
    debounce(() => {
      fireEvent.mouseUp(dst3[0])
    }, 100)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should add ICX7550-24 model correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await screen.findByText(/Select family and model to be configured/i)

    const family = await screen.findByText('ICX-7550')
    await userEvent.click(family)
    const model = await screen.findByText('24')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    const dst1 = await screen.findAllByTestId('untagged_module1_0')
    const src1 = await screen.findAllByTestId('untagged_module1_10')
    fireEvent.mouseDown(src1[0])
    fireEvent.mouseMove(dst1[0])
    debounce(() => {
      fireEvent.mouseUp(dst1[0])
    }, 100)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    const dst2 = await screen.findAllByTestId('tagged_module1_11')
    const src2 = await screen.findAllByTestId('tagged_module1_20')
    fireEvent.mouseDown(src2[0])
    fireEvent.mouseMove(dst2[0])
    debounce(() => {
      fireEvent.mouseUp(dst2[0])
    }, 100)

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should add ICX7650-48F model correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    const family = await screen.findByText('ICX-7650')
    await userEvent.click(family)
    const model = await screen.findByText('48F')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('checkbox', { name: /Module 2/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Module 3/ }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should add ICX7850-48F model correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await screen.findByText(/Select family and model to be configured/i)

    const family = await screen.findByText('ICX-7850')
    await userEvent.click(family)
    const model = await screen.findByText('48F')
    await userEvent.click(model)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    fireEvent.mouseOver(await screen.findByTestId('untagged_module2_6'))
    await screen.findByText(/Networks on this port/i)
    await userEvent.click(await screen.findByTestId('untagged_module2_6'))
    await userEvent.click(await screen.findByTestId('untagged_module1_25'))


    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    fireEvent.mouseOver(await screen.findByTestId('tagged_module2_6'))
    await screen.findByText('Port set as untagged')

    fireEvent.mouseOver(await screen.findByTestId('tagged_module1_47'))
    await screen.findByText(/Networks on this port/i)
    await userEvent.click(await screen.findByTestId('tagged_module1_47'))
    await userEvent.click(await screen.findByTestId('tagged_module2_5'))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should disable port correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[vlans[1]]}
        />
      </Provider>
    </IntlProvider>)

    await screen.findByText(/Select Ports By Model/i)
    await screen.findByText(/Select family and model to be configured/i)

    const family = await screen.findByText('ICX-7550')
    await userEvent.click(family)
    const model = await screen.findByText('24P')
    await userEvent.click(model)
    await userEvent.click(await screen.findByRole('checkbox', { name: /Module 3/ }))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(
      await screen.findByTestId('untagged_module1_19')).toHaveAttribute('data-disabled', 'true')
    expect(await screen.findByTestId('untagged_module3_1')).toHaveAttribute('data-disabled', 'true')
    await userEvent.click(await screen.findByTestId('untagged_module1_20'))
    await userEvent.click(await screen.findByTestId('untagged_module3_0'))
    fireEvent.mouseOver(await screen.findByTestId('untagged_module1_19'))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    fireEvent.mouseOver(await screen.findByTestId('tagged_module1_20'))
    await userEvent.click(await screen.findByTestId('tagged_module1_11'))

    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    fireEvent.mouseOver(await screen.findByTestId('untagged_module1_11'))
    await screen.findByText('Port set as tagged')
  })

  it('should render select model step correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanPortsContext.Provider
        value={{
          vlanSettingValues: vlanSettingValues,
          setVlanSettingValues: jest.fn(),
          vlanList: [vlans[1]],
          editMode: true
        }}
      >
        <StepsForm onFinish={jest.fn()}>
          <StepsForm.StepForm>
            <SelectModelStep editMode={true} />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </IntlProvider>)

    await screen.findByText(/Family/i)
    await screen.findByText(/Model/i)
    await screen.findByText(/Select Modules/i)

    // TODO:
    // const radio = await screen.findByRole('radio', { name: /ICX-7550/, checked: true })
  })

  it('should render untagged ports step correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanPortsContext.Provider
        value={{
          vlanSettingValues: {
            ...vlanSettingValues,
            switchFamilyModels: {
              ...vlanSettingValues.switchFamilyModels,
              untaggedPorts: null
            }
          },
          setVlanSettingValues: jest.fn(),
          vlanList: [vlans[1]],
          editMode: true
        }}
      >
        <StepsForm onFinish={jest.fn()}>
          <StepsForm.StepForm>
            <UntaggedPortsStep />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </IntlProvider>)

    await screen.findByText(
      /Select the untagged ports \(access ports\) for this model \(ICX7150-48\)/i
    )
  })

  it('should render tagged ports step correctly', async () => {
    render(<IntlProvider locale='en'>
      <VlanPortsContext.Provider
        value={{
          vlanSettingValues: {
            ...vlanSettingValues,
            switchFamilyModels: {
              ...vlanSettingValues.switchFamilyModels,
              taggedPorts: null
            }
          },
          setVlanSettingValues: jest.fn(),
          vlanList: [vlans[1]],
          editMode: true
        }}
      >
        <StepsForm onFinish={jest.fn()}>
          <StepsForm.StepForm>
            <TaggedPortsStep />
          </StepsForm.StepForm>
        </StepsForm>
      </VlanPortsContext.Provider>
    </IntlProvider>)

    await screen.findByText(
      /Select the tagged ports \(access ports\) for this model \(ICX7150-48\)/i
    )
  })

  //TODO: edit mode
  it.skip('should render edit mode correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={records[0]}
          currrentRecords={records}
          onCancel={jest.fn()}
          onSave={jest.fn()}
          vlanList={[vlans[1]]}
        />
      </Provider>
    </IntlProvider>
    )

    await screen.findByText(/Select Ports By Model/i)
  })
})
