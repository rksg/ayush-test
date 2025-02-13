import '@testing-library/jest-dom'
import { BrowserRouter }                       from '@acx-ui/react-router-dom'
import { renderHook, render, screen, waitFor } from '@acx-ui/test-utils'

import { useLayoutContext } from '../Layout'
import { Tabs }             from '../Tabs'

import { PageHeader } from '.'

describe('PageHeader', () => {
  afterEach(() => jest.restoreAllMocks())

  it('should render basic page header', () => {
    const { asFragment } = render(<PageHeader title='Basic' />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with tabs', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Tabs'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          footer={
            <Tabs>
              <Tabs.TabPane tab='Overview' key='1' />
            </Tabs>
          }
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render tabs with Beta indicator', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Tabs'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          footer={
            <Tabs>
              <Tabs.TabPane tab='Tab1' key='1' />
              <Tabs.TabPane tab='Tab2' key='2' isBetaFeature />
              <Tabs.TabPane tab='Tab3' key='3' />
            </Tabs>
          }
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render tabs with Beta indicator (special case)', () => {
    const tabs = ['Tab1', 'Tab2', 'Tab3']
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Tabs'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          footer={
            <Tabs>
              <Tabs.TabPane tab='Overview' key='1' />
              { tabs.map((tab, index) =>
                <Tabs.TabPane tab={tab} key={tab} isBetaFeature={index===1} />)
              }
            </Tabs>
          }
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render tabs with Beta indicator (only one tab)', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Tabs'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          footer={
            <Tabs>
              <Tabs.TabPane tab='Overview' key='1' isBetaFeature />
            </Tabs>
          }
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render tabs correctly (no content)', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Tabs'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          footer={
            <Tabs></Tabs>
          }
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with title, breadcrumb & subtitle', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Subtitle'
          breadcrumb={[
            { text: 'Root' },
            { text: 'Networks', link: '/networks' }
          ]}
          subTitle={<span>Subtitle</span>}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with subtitles and dividers', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Subtitles & Dividers'
          breadcrumb={[
            { text: 'Networks', link: '/networks' }
          ]}
          subTitle={[
            { label: 'Label 1', value: ['Value 1'] },
            { label: 'Label 2', value: ['Value 2'] },
            { label: 'Label 3', value: ['Value 3', 'Value 4'] }
          ]}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with titleExtra', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Subtitle'
          titleExtra={<div>Title Extra</div>}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header with titlePrefix', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          titlePrefix={<div>Title Prefi</div>}
          title='With Subtitle'
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render page header without bottom padding', () => {
    const { asFragment } = render(
      <BrowserRouter>
        <PageHeader
          title='With Subtitle'
          titleExtra={<div>Title Extra</div>}
          footerSpacer={false}
        />
      </BrowserRouter>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('automatially adds key for extra that does not add it', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    render(<PageHeader
      title='Title'
      extra={[
        <button>Button 1</button>,
        <button>Button 2</button>
      ]}
    />, { route: {} })

    expect(await screen.findAllByRole('button')).toHaveLength(2)
    expect(spy).not.toBeCalled()
  })

  it('sets y for layout context', async () => {
    const { result } = renderHook(() => useLayoutContext())

    const setPageHeaderY = jest.spyOn(result.current, 'setPageHeaderY').mockImplementation(() => {})

    render(<>
      <PageHeader title='Title' />
      <div></div>
      <div className='sticky-top'></div>
    </>, { route: true })

    await waitFor(() => expect(setPageHeaderY).toBeCalled())
  })
})
