import { render, screen } from '@acx-ui/test-utils'

import { ServiceInfo } from '.'

const data = [
  {
    title: 'title1',
    content: 'content1'
  },
  {
    title: <>title2</>,
    content: <>content2</>
  },
  {
    title: () => (<>title3</>),
    content: () => ('content3')
  }
]

describe('ServiceInfo', () => {
  it('Should render ServiceInfo successfully', async () => {
    render(
      <ServiceInfo data={data} />
    )
    expect(await screen.findByText('title1')).toBeVisible()
    expect(await screen.findByText('content1')).toBeVisible()
    expect(await screen.findByText('title2')).toBeVisible()
    expect(await screen.findByText('content2')).toBeVisible()
    expect(await screen.findByText('title3')).toBeVisible()
    expect(await screen.findByText('content3')).toBeVisible()
  })
})