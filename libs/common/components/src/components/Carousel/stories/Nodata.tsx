import { Carousel } from '..'


export function Nodata () {
  const title = 'Did you know?'
  const subTitle = 'No data to report'
  const noData = 'When your network becomes active, we will have valuable insights for you here'

  const props = {
    dots: { className: 'carousel-dots' },
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    style: { height: 410, width: 282 }
  }
  return <Carousel contentList={[[noData]]}
    classList='carousel-card no-data'
    title={title}
    subTitle={subTitle}
    {...props}></Carousel>
}