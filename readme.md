# git

## 使用

在`vite.config.js` 增加

```js
import MyGitPlugin from '@52css/my-git-plugin';

export default defineConfig({
  plugins: [vue(), MyGitPlugin()],
  build: {
    assetsInlineLimit: 4096, // 修改成0，所有的资源都内联
  }
});
```

## 加载后`console.log`访问

```js
__MY_GIT_PLUGIN__ // 显示相应的git信息
```

## 如果需要别名

配置传递名称，console.log 相应打印出来

```js
MyGitPlugin('$abc')
```
