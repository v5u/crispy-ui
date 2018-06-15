import axios from 'axios'
import packageJson from '../../package.json'
import { Loading, Message } from 'element-ui'

let util = {}
util.title = function (title) {
  title = title ? title + ' - crispy' : 'crispy'
  window.document.title = title
}

const ajaxUrl = packageJson.config.apiUrl
const ajaxTimeout = packageJson.config.apiTimeout

util.ajax = axios.create({
  baseURL: ajaxUrl,
  timeout: ajaxTimeout
})

var loadinginstace
util.ajax.interceptors.request.use(
  config => {
    // element ui Loading方法
    loadinginstace = Loading.service({ fullscreen: true })
    return config
  },
  error => {
    loadinginstace.close()
    Message.error({
      message: '接口调用失败 request'
    })
    return Promise.reject(error)
  }
)

// http响应拦截器
util.ajax.interceptors.response.use(
  data => {// 响应成功关闭loading
    loadinginstace.close()
    return data
  },
  error => {
    if (error.response) {
      var message = ''
      switch (error.response.status) {
        case 404:
          message = '接口地址错误'
        case 400:
          message = error.response.data.message
          break;
      }
      message && Message.error({
        message: message
      })
    }

    loadinginstace.close()
    return Promise.reject(error)
  }
)

export default util
