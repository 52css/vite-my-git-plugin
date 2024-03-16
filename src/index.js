const ChildProcess = require("child_process");

const execSync = ChildProcess.execSync;

const apiIndex = process.argv.findIndex((x) => x === "--api");
let API = "";

if (apiIndex >= 0) {
  API = process.argv[apiIndex + 1];
  process.env.API = API;
}

const COMMIT_ID = "git rev-parse HEAD";
const CURRENT_BRANCH = "git name-rev --name-only HEAD";
// 1. git symbolic-ref --short -q HEAD
// 2. git rev-parse --abbrev-ref HEAD
// 3. git symbolic-ref HEAD | sed -e "s/^refs\/heads\///"
const COMMIT_DETAIL = 'git log --pretty=format:"%h - %an, %ar : %s"  -5';

let commitId = "";
let currentBranch = "";
let commitDetail = "";
const month =
  new Date().getMonth() + 1 < 10
    ? "0" + (new Date().getMonth() + 1)
    : new Date().getMonth() + 1;
const day =
  new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
const ss =
  new Date().getSeconds() < 10
    ? "0" + new Date().getSeconds()
    : new Date().getSeconds();
const mm =
  new Date().getMinutes() < 10
    ? "0" + new Date().getMinutes()
    : new Date().getMinutes();
const hh =
  new Date().getHours() < 10
    ? "0" + new Date().getHours()
    : new Date().getHours();
const buildTime =
  new Date().getFullYear() +
  "-" +
  month +
  "-" +
  day +
  "\xa0" +
  hh +
  ":" +
  mm +
  ":" +
  ss;

try {
  commitId = execSync(COMMIT_ID).toString().trim();
} catch (ex) {
  console.log(ex);
}

try {
  commitDetail = execSync(COMMIT_DETAIL).toString().trim();
} catch (ex) {
  console.log(ex);
}
try {
  currentBranch = execSync(CURRENT_BRANCH).toString().trim();
} catch (ex) {
  console.log(ex);
}

function MyGitPlugin(injectKey = "__MY_GIT_PLUGIN__") {
  return {
    name: "my-git-plugin",
    // apply: 'build', // 在构建时使用
    config() {
      return {
        // 全局变量，可以在整个应用中使用
        define: {
          __API__: JSON.stringify(API),
          [injectKey]: JSON.stringify({
            API,
            COMMIT_ID: commitId,
            CURRENT_BRANCH: currentBranch,
            COMMIT_DETAIL: commitDetail
              .split("\n")
              .map((x) => JSON.stringify(x)),
            BUILD_TIME: buildTime,
          }),
        },
      };
    },
    transformIndexHtml() {
      const HtmlStr = `window.${injectKey} = ${injectKey}`;
      // 将htmlStr插到body里
      return [
        {
          tag: "script",
          attrs: { defer: true },
          children: HtmlStr,
          injectTo: "body",
        },
      ];
    },
    // async transformIndexHtml() {
    //   const res = await execAsync('git log -1 --format=%cI')
    //   const HtmlStr = `const gitInfo = ${JSON.stringify(res)}`
    //   // 将htmlStr插到body里
    //   return [
    //     {
    //       tag: 'script',
    //       attrs: { defer: true },
    //       children: HtmlStr,
    //       injectTo: 'body',
    //     },
    //   ]
    // },
  };
}

module.exports = {
  MyGitPlugin,
};
