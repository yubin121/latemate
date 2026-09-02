import type { Page } from '@playwright/test'

const KAKAO_SDK_STUB = `
(function () {
  var noop = function () {}
  function LatLng(lat, lng) {
    this._lat = lat
    this._lng = lng
    this.getLat = function () { return lat }
    this.getLng = function () { return lng }
  }
  function LatLngBounds() {
    this.extend = noop
    this.isEmpty = function () { return false }
  }
  function Size() {}
  function Point() {}
  function MarkerImage() {}
  function Map(container) {
    this._container = container
    this.setBounds = noop
    this.setCenter = noop
    this.getCenter = function () { return new LatLng(37.4979, 127.0276) }
    this.setLevel = noop
    this.getLevel = function () { return 3 }
    this.panTo = noop
    this.relayout = noop
    this.addOverlayMapTypeId = noop
    if (container && container.setAttribute) {
      container.setAttribute('data-e2e-kakao-map', 'ready')
    }
  }
  function Marker() {
    this.setMap = noop
    this.setPosition = noop
    this.getPosition = function () { return new LatLng(0, 0) }
  }
  function CustomOverlay(options) {
    this._map = null
    this._position = options && options.position
    this._content = options && options.content
    this.setMap = function (map) { this._map = map }
    this.setPosition = function (pos) { this._position = pos }
    this.getPosition = function () { return this._position }
    this.getContent = function () { return this._content }
  }
  window.kakao = {
    maps: {
      load: function (cb) { setTimeout(cb, 0) },
      LatLng: LatLng,
      LatLngBounds: LatLngBounds,
      Map: Map,
      Marker: Marker,
      CustomOverlay: CustomOverlay,
      MarkerImage: MarkerImage,
      Size: Size,
      Point: Point,
      event: { addListener: noop, removeListener: noop },
      services: {
        Status: { OK: 'OK', ZERO_RESULT: 'ZERO_RESULT', ERROR: 'ERROR' },
        Geocoder: function () {
          this.coord2Address = function (_lng, _lat, cb) {
            cb([{ address: { address_name: '서울 강남구 역삼동' } }], 'OK')
          }
        },
        Places: function () {
          this.keywordSearch = function (_kw, cb) { cb([], 'ZERO_RESULT') }
        },
      },
    },
  }
})()
`

export async function stubKakaoMaps(page: Page) {
  await page.route(/dapi\.kakao\.com\/v2\/maps\/sdk\.js/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript; charset=utf-8',
      body: KAKAO_SDK_STUB,
    }),
  )

  await page.route(/dapi\.kakao\.com\/v2\/local\/search\/keyword\.json/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        documents: [
          {
            id: '1',
            place_name: '강남역 1번 출구',
            address_name: '서울 강남구 역삼동',
            road_address_name: '서울 강남구 강남대로 지하 396',
            x: '127.0276',
            y: '37.4979',
          },
        ],
        meta: { total_count: 1, pageable_count: 1, is_end: true },
      }),
    }),
  )

  await page.route(/apis-navi\.kakaomobility\.com\/v1\/directions/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        routes: [
          {
            result_code: 0,
            summary: { duration: 600, distance: 3200 },
          },
        ],
      }),
    }),
  )
}
