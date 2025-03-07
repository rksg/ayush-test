import { TableHighlightFnArgs }   from '@acx-ui/components'
import { Event }                  from '@acx-ui/rc/utils'
import { render, screen, within } from '@acx-ui/test-utils'
import { noDataDisplay }          from '@acx-ui/utils'

import { events, eventsMeta }                   from './__tests__/fixtures'
import { getDescription, getDetail, valueFrom } from './helpers'
import { typeMapping }                          from './mapping'

describe('getDescription', () => {
  const event = {
    ...events[0],
    ...eventsMeta.find(meta => meta.id === events[0].id)
  } as Event

  it('renders entity links', async () => {
    render(<>{getDescription(event)}</>, { route: true })

    expect(await screen.findByRole('link')).toBeVisible()
  })

  it('handles search highlight', async () => {
    const highlightFn: TableHighlightFnArgs = (template, replace) => {
      return template.replaceAll('channel', replace as (keyword: string) => string)
    }

    render(<>{getDescription(event, highlightFn)}</>, { route: true })

    expect(await screen.findByRole('link')).toBeVisible()
    expect(await screen.findAllByRole('generic', {
      name: (_, el) => el.nodeName === 'SPAN'
    })).toHaveLength(3)
  })

  it('renders -- if error in parsing template', async () => {
    const { container } = render(<>{getDescription({
      ...event,
      message: '{ xxxx: bad template '
    })}</>, { route: true })

    expect(container).toHaveTextContent('{ xxxx: bad template')
  })

  it('handles keyword of formatjs', async () => {
    const { container } = render(<>{getDescription({
      ...event,
      // eslint-disable-next-line @typescript-eslint/quotes
      message: `{ "message_template": "<%%severity> '%%severity' {%%severity}" }`
    })}</>, { route: true })

    expect(container).toHaveTextContent("<Info> 'Info' {Info}")
  })

  describe('event message with @@remoteApName', () => {
    const eventWithRemoteApName = {
      ...events[4],
      ...eventsMeta.find(meta => meta.id === events[4].id)
    } as Event

    it('renders entity links with replaced names', async () => {
      render(<>{getDescription(eventWithRemoteApName)}</>, { route: true })

      const links = await screen.findAllByRole('link')
      expect(links).toHaveLength(2)
      expect(await within(links[0]).findByText('vEdge_1101_n1')).toBeVisible()
      expect(await within(links[1]).findByText('R750-11-40')).toBeVisible()
    })
  })
})

describe('valueFrom', () => {
  it('renders value from map', () => {
    expect(valueFrom(typeMapping, 'ADMIN')).toBe('Admin')
  })

  it('renders -- if key not in map', () => {
    expect(valueFrom(typeMapping, 'XXXX')).toBe(noDataDisplay)
  })
})

describe('getDetail', () => {
  const event = {
    ...events[0],
    ...eventsMeta.find(meta => meta.id === events[0].id)
  } as Event

  it('renders entity links', async () => {
    render(<>{getDetail(event)}</>, { route: true })

    expect(await screen.findByRole('link')).toBeVisible()
  })
})
