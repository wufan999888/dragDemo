/*
 * 拖拽指令
 */
import { getIOSWebviewHeaderTop } from '@/module/getIOSWebviewHeaderTop'
export default {
  inserted (el) { // 这里的el是标签中的v-drag
    const positionParams = {
      x: 20, // 初始位置
      y: 105,
      startX: 0,
      startY: 0,
      endX: 20,
      endY: 105,
      gapX: 10, // 距离两边
      gapY: 50// 距离下方
    }
    el.addEventListener('touchstart', function (e) {
      positionParams.startX = e.touches[0].pageX
      positionParams.startY = e.touches[0].pageY
    })
    el.addEventListener('touchmove', function (e) {
      if (e.touches.length > 0) {
        const offsetX = e.touches[0].pageX - positionParams.startX
        const offsetY = e.touches[0].pageY - positionParams.startY
        let x = positionParams.x - offsetX
        let y = positionParams.y - offsetY
        // 限制边界
        if (x + el.offsetWidth > document.documentElement.clientWidth) {
          x = document.documentElement.clientWidth - el.offsetWidth
        }
        // 标题栏宽度
        const hight = getIOSWebviewHeaderTop()
        if (y + el.offsetHeight > document.documentElement.clientHeight - hight) {
          y = document.documentElement.clientHeight - el.offsetHeight - hight
        }
        if (x < 0) { x = 0 }
        if (y < positionParams.gapY) { y = positionParams.gapY }
        el.style.right = x + 'px'
        el.style.bottom = y + 'px'
        positionParams.endX = x
        positionParams.endY = y
        e.preventDefault()
      }
    })
    el.addEventListener('touchend', function (e) {
      // 吸附
      if (positionParams.endX < document.documentElement.clientWidth / 2) {
        el.style.right = positionParams.gapX + 'px'
        positionParams.endX = positionParams.gapX
      } else {
        el.style.right = document.documentElement.clientWidth - el.offsetWidth - positionParams.gapX + 'px'
        positionParams.endX = document.documentElement.clientWidth - el.offsetWidth - positionParams.gapX
      }
      positionParams.x = positionParams.endX
      positionParams.y = positionParams.endY
      positionParams.startX = 0
      positionParams.startY = 0
    })
  }
}
