import request from '@/utils/http';

const getTestApi = () =>
  request({
    url: '/api/todos/1',
    method: 'get'
  });

const postTestApi = () =>
  request(
    {
      url: '/api/posts',
      method: 'post'
    },
    {},
    {
      loading: true
    }
  );

export default {
  getTestApi,
  postTestApi
};
