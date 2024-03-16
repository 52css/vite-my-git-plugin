# git

## 使用

在`vite.config.js` 增加

```js
import { MyGitPlugin } from '@52css/my-git-plugin';

export default defineConfig({
  plugins: [vue(), MyGitPlugin()],
  ...
});
```

## 控制台访问

```js
console.log(__MY_GIT_PLUGIN__) // 显示相应的git信息
```

## 如果需要别名

在`vite.config.js` 增加

```js
import { MyGitPlugin } from '@52css/my-git-plugin';

export default defineConfig({
  plugins: [vue(), MyGitPlugin('$abc')],
  ...
});
```

## 控制台访问

```js
console.log($abc) // 显示相应的git信息
```