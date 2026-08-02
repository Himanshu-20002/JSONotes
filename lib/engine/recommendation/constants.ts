export const RECOMMENDATION_WEIGHTS = {
  contentFit: 0.45,
  geometryFit: 0.35,
  readability: 0.20,
}

export const RECOMMENDATION_PENALTIES = {
  collisionPerPair: 50,
  overflowBase: 25,
  overflowPixelRatio: 0.1, // 10 points penalty per 100px overflow
}
