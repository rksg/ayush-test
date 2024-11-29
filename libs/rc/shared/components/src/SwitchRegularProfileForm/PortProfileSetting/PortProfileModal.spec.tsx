import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent                              from '@testing-library/user-event'
import { Modal }                              from 'antd'
import { debounce }                           from 'lodash'
import { rest }                               from 'msw'
import { IntlProvider }                       from 'react-intl'

import { StepsForm }                          from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { SwitchRbacUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }                          from '@acx-ui/store'
import { mockServer }                         from '@acx-ui/test-utils'

import { vlans, records, portSlotsData, vlanSettingValues } from '../__tests__/fixtures'

import { SelectModelStep }   from './SelectModelStep'
import { TaggedPortsStep }   from './TaggedPortsStep'
import { UntaggedPortsStep } from './UntaggedPortsStep'
import VlanPortsContext      from './VlanPortsContext'
import { VlanPortsModal }    from './VlanPortsModal'

const portlist = {
  fields: [
    'portIdentifier',
    'id'
  ],
  totalCount: 16,
  page: 1,
  data: [
    {
      name: 'GigabitEthernet1/1/9',
      portIdentifier: '1/1/9',
      authDefaultVlan: '10'
    },
    {
      name: 'GigabitEthernet1/1/10',
      portIdentifier: '1/1/10',
      authDefaultVlan: '5'
    }
  ]
}

describe('VlanPortsModal', () => {
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchPortlist.url,
        (req, res, ctx) => res(ctx.json(portlist)))
    )
  })

  afterEach(() => {
    Modal.destroyAll()
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

    await userEvent.click(await screen.findByTestId('untagged_module1_1_1'))
    await userEvent.click(await screen.findByTestId('untagged_module1_2_1'))
    await userEvent.click(await screen.findByTestId('untagged_module1_3_1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByTestId('tagged_module1_1_2'))
    await userEvent.click(await screen.findByTestId('tagged_module1_2_2'))
    await userEvent.click(await screen.findByTestId('tagged_module1_3_2'))
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

    const dst1 = await screen.findAllByTestId('untagged_module1_1_1')
    const src1 = await screen.findAllByTestId('untagged_module1_1_11')
    fireEvent.mouseDown(src1[0])
    fireEvent.mouseMove(dst1[0])
    debounce(() => {
      fireEvent.mouseUp(dst1[0])
    }, 100)

    const dst2 = await screen.findAllByTestId('untagged_module1_2_1')
    const src2 = await screen.findAllByTestId('untagged_module1_2_2')
    fireEvent.mouseDown(src2[0])
    fireEvent.mouseMove(dst2[0])
    debounce(() => {
      fireEvent.mouseUp(dst2[0])
    }, 100)

    const dst3 = await screen.findAllByTestId('untagged_module1_3_1')
    const src3 = await screen.findAllByTestId('untagged_module1_3_4')
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
    const dst1 = await screen.findAllByTestId('tagged_module1_1_1')
    const src1 = await screen.findAllByTestId('tagged_module1_1_11')
    fireEvent.mouseDown(src1[0])
    fireEvent.mouseMove(dst1[0])
    debounce(() => {
      fireEvent.mouseUp(dst1[0])
    }, 100)

    const dst2 = await screen.findAllByTestId('tagged_module1_2_1')
    const src2 = await screen.findAllByTestId('tagged_module1_2_2')
    fireEvent.mouseDown(src2[0])
    fireEvent.mouseMove(dst2[0])
    debounce(() => {
      fireEvent.mouseUp(dst2[0])
    }, 100)

    const dst3 = await screen.findAllByTestId('tagged_module1_3_1')
    const src3 = await screen.findAllByTestId('tagged_module1_3_4')
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

    const dst1 = await screen.findAllByTestId('untagged_module1_1_1')
    const src1 = await screen.findAllByTestId('untagged_module1_1_11')
    fireEvent.mouseDown(src1[0])
    fireEvent.mouseMove(dst1[0])
    debounce(() => {
      fireEvent.mouseUp(dst1[0])
    }, 100)

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    const dst2 = await screen.findAllByTestId('tagged_module1_1_12')
    const src2 = await screen.findAllByTestId('tagged_module1_1_21')
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
    fireEvent.mouseOver(await screen.findByTestId('untagged_module1_2_7'))
    await screen.findByText(/VLANs/i)
    await userEvent.click(await screen.findByTestId('untagged_module1_2_7'))
    await userEvent.click(await screen.findByTestId('untagged_module1_1_26'))


    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    fireEvent.mouseOver(await screen.findByTestId('tagged_module1_2_7'))
    await screen.findByText('Port set as untagged')

    fireEvent.mouseOver(await screen.findByTestId('tagged_module1_1_48'))
    await screen.findByText(/VLANs/i)
    await userEvent.click(await screen.findByTestId('tagged_module1_1_48'))
    await userEvent.click(await screen.findByTestId('tagged_module1_2_6'))

    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should disable port correctly', async () => {
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          vlanId={5}
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
      await screen.findByTestId('untagged_module1_1_9')).toHaveAttribute('data-disabled', 'true')
    expect(
      await screen.findByTestId('untagged_module1_1_20')).toHaveAttribute('data-disabled', 'true')
    expect(
      await screen.findByTestId('untagged_module1_3_2')).toHaveAttribute('data-disabled', 'true')
    await userEvent.click(await screen.findByTestId('untagged_module1_1_21'))
    await userEvent.click(await screen.findByTestId('untagged_module1_3_1'))
    fireEvent.mouseOver(await screen.findByTestId('untagged_module1_1_20'))

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(
      await screen.findByTestId('tagged_module1_1_10')).toHaveAttribute('data-disabled', 'true')
    fireEvent.mouseOver(await screen.findByTestId('tagged_module1_1_21'))
    await userEvent.click(await screen.findByTestId('tagged_module1_1_12'))

    await userEvent.click(await screen.findByRole('button', { name: 'Back' }))
    fireEvent.mouseOver(await screen.findByTestId('untagged_module1_1_12'))
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
      /Select the tagged ports \(trunk ports\) for this model \(ICX7150-48\)/i
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

  it('should render correctly in switch level', async () => {
    const setVlan = jest.fn()
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={setVlan}
          vlanList={[]}
          switchFamilyModel='ICX7150-C08P'
          portSlotsData={portSlotsData}
          portsUsedBy={{
            lag: {
              '1/1/3': 'LAG1'
            }
          }}
        />
      </Provider>
    </IntlProvider>)

    await userEvent.click(await screen.findByTestId('untagged_module1_1_1'))
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await userEvent.click(await screen.findByTestId('tagged_module1_1_2'))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))

    expect(setVlan).toHaveBeenLastCalledWith({
      id: '',
      model: 'ICX7150-C08P',
      slots: [
        { enable: undefined, option: undefined, slotNumber: undefined }
      ],
      taggedPorts: ['1/1/2'],
      title: '',
      untaggedPorts: ['1/1/1'],
      vlanConfigName: ''
    })
  })

  it('should render port status correctly', async () => {
    const setVlan = jest.fn()
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={setVlan}
          vlanList={[]}
          switchFamilyModel={'ICX7150-C08P'}
          portSlotsData={portSlotsData}
          portsUsedBy={{
            lag: { '1/1/6': 'LAG1' },
            untagged: {
              '1/1/7': 666,
              '1/1/5': 555
            }
          }}
        />
      </Provider>
    </IntlProvider>)

    const untagged1_1_7 = await screen.findByTestId('untagged_module1_1_7')
    expect(untagged1_1_7).toHaveAttribute('data-disabled', 'true')

    await userEvent.hover(untagged1_1_7)
    await waitFor(async () => expect(await screen.findByRole('tooltip')).toBeInTheDocument())
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('Port is already an untagged member of VLAN 666')

  })

  it('should render port status (LAG) correctly', async () => {
    const setVlan = jest.fn()
    render(<IntlProvider locale='en'>
      <Provider>
        <VlanPortsModal
          open={true}
          editRecord={undefined}
          currrentRecords={undefined}
          onCancel={jest.fn()}
          onSave={setVlan}
          vlanList={[]}
          switchFamilyModel={'ICX7150-C08P'}
          portSlotsData={portSlotsData}
          portsUsedBy={{
            lag: { '1/1/6': 'LAG1' },
            untagged: {
              '1/1/7': 666,
              '1/1/5': 555
            }
          }}
        />
      </Provider>
    </IntlProvider>)

    const untagged1_1_6 = await screen.findByTestId('untagged_module1_1_6')
    expect(untagged1_1_6).toHaveAttribute('data-disabled', 'true')

    await userEvent.hover(untagged1_1_6)
    await waitFor(async () => expect(await screen.findByRole('tooltip')).toBeInTheDocument())
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('Port is member of LAG – LAG1')
  })

})
