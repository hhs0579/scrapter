import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

// Firebase 초기화 (에러 발생해도 앱은 계속 실행)
import('./config/firebase').then(() => {
  console.log('✅ Firebase 모듈 로드 완료')
}).catch((error) => {
  console.warn('⚠️ Firebase 모듈 로드 실패:', error)
  console.warn('Firebase 없이 앱을 계속 실행합니다.')
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 마운트 전 확인
console.log('=== Vue 앱 초기화 시작 ===')
console.log('App:', App)
console.log('Router:', router)
console.log('Pinia:', pinia)

const appElement = document.getElementById('app')
console.log('App Element:', appElement)

if (!appElement) {
  console.error('❌ #app 요소를 찾을 수 없습니다!')
  document.body.innerHTML = '<div style="padding: 20px; color: red;">#app 요소를 찾을 수 없습니다!</div>'
} else {
  try {
    app.mount('#app')
    console.log('✅ Vue 앱 마운트 완료')
  } catch (error) {
    console.error('❌ Vue 앱 마운트 오류:', error)
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message)
      console.error('오류 스택:', error.stack)
    }
  }
}
