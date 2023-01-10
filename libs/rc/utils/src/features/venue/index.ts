export function getImageFitPercentage (containerCoordsX: number,
  containerCoordsY: number, imageCoordsX: number, imageCoordsY: number) {
  let differencePercentage = 0

  if (containerCoordsX !== imageCoordsX || containerCoordsY !== imageCoordsY) {
    if (containerCoordsX > imageCoordsX) {
      differencePercentage = (imageCoordsX / containerCoordsX) * 100
    }
    if (imageCoordsX > containerCoordsX) {
      const temp_differencePercentage = (containerCoordsX / imageCoordsX) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
    if (containerCoordsY > imageCoordsY) {
      const temp_differencePercentage = (imageCoordsY / containerCoordsY) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
    if (imageCoordsY > containerCoordsY) {
      const temp_differencePercentage = (containerCoordsY / imageCoordsY) * 100
      differencePercentage = (temp_differencePercentage < differencePercentage)
        ? temp_differencePercentage : differencePercentage
    }
  }
  return differencePercentage
}