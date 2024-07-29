import axios from 'axios';
import qs from 'qs';
import { ElMessage } from 'element-plus';
import router from '@/router/index';
import { ElLoading } from 'element-plus';

// 全局配置
// const apiUrl = import.meta.env.VITE_API_DOMAIN;
let loadingService;
axios.defaults.withCredentials = false;
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
// 允许跨域
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

function myAxios(axiosConfig, customOptions, loadings) {
  const { timeout } = { timeout: 8000, ...customOptions };
  const service = axios.create({
    // baseURL: apiUrl, // 设置统一的请求前缀
    timeout // 设置统一的超时时长
  });

  // 是否开启/取消重复请求
  // const cancel = {
  //   cancel_request: false,
  //   ...customOptions
  // }
  // 是否开启loading, 默认为 false
  const loading = {
    loading: loadings?.loading || false
  };
  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      const { method, data, headers } = config;

      if (['post', 'put', 'delete'].includes(method)) {
        config.data = qs.parse(data); //序列化
      }
      // 若是有做鉴权token , 就给头部带上token
      const token = localStorage.getItem('token');
      if (token) {
        if (headers) {
          headers.Authorization = token;
        }
      }
      // 请求之前发送loading
      if (loading.loading) {
        loadingService = ElLoading.service({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.3)'
        });
      }
      return config;
    },
    (error) => {
      ElMessage({
        message: error.data.error.message,
        type: 'error'
      });
      return Promise.reject(error.data.error.message);
    }
  );
  // 响应拦截器
  service.interceptors.response.use(
    (res) => {
      // 在请求结束后，移除本次请求
      // 请求之后关闭loading
      if (loading.loading) {
        loadingService.close();
      }
      // 对响应数据进行处理，例如检查统一的字段（如 statusCode)
      if (res.status === 200 || res.data.statusCode === 200) {
        return Promise.resolve(res);
      }
      return Promise.reject(res);
    },
    (error) => {
      loadingService?.close();

      const statusTextMap = {
        400: '发出的请求有错误，服务器没有进行新建或修改数据的操作',
        401: '登录失效，请重新登录',
        403: '用户得到授权，但是访问是被禁止的',
        404: '网络请求不存在',
        406: '请求的格式不可得',
        410: '请求的资源被永久删除，且不会再得到的',
        422: '当创建一个对象时，发生一个验证错误',
        500: '服务器发生错误，请检查服务器',
        502: '网关错误',
        503: '服务不可用，服务器暂时过载或维护',
        504: '网关超时'
      };

      if (error.response && error.response.status) {
        const statusText = statusTextMap[error.response.status] ?? '其他错误';
        ElMessage({
          message: `${statusText}(${error.response.status})`,
          type: 'error'
        });
        if (error.response.status === 401) {
          // TODO: 退出登录时清除用户数据和权限
          router.replace({
            path: '/Login'
          });
        }
        return Promise.reject(error);
      }

      return Promise.reject(new Error('网络请求失败，请稍后重试'));
    }
  );
  return service(axiosConfig);
}

export default myAxios;
