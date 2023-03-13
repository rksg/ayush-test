import { Carousel } from '..'


export function Basic () {
  const content = 'The Busiest Wi-Fi network in terms of ' +
  'users last week was CORP-PSK, accounting for 42% of total users'
  const title = 'Did you know?'

  const contentList = [[content, content, content], [content, content, content]]
  const props = {
    dots: { className: 'carousel-dots' },
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true
  }
  return <Carousel contentList={contentList}
    classList='carousel-card'
    title={title}
    {...props}></Carousel>
}