const ChildProcess = require("child_process");
const execSync = ChildProcess.execSync;
const getCurrentTimeWithOffset = () => {
  const currentDate = new Date();

  // 获取当前时区名称
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // 判断当前时区是否为 UTC
  if (timeZone === "UTC" || timeZone === "Etc/UTC") {
    // 当前时区为 UTC，需要添加 8 小时的时差
    currentDate.setHours(currentDate.getHours() + 8);
  }

  return currentDate;
};
const getBuildTime = () => {
  const now = getCurrentTimeWithOffset();
  const month =
    now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
  const day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
  const ss = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds();
  const mm = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
  const hh = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
  const buildTime =
    now.getFullYear() +
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

  return buildTime;
};
const getArgs = () =>
  process.argv.reduce((args, arg) => {
    // long arg
    if (arg.slice(0, 2) === "--") {
      const longArg = arg.split("=");
      const longArgFlag = longArg[0].slice(2);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === "-") {
      const flags = arg.slice(1).split("");
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
    return args;
  }, {});
const args = getArgs();


const COMMIT_ID = "git rev-parse HEAD";
const CURRENT_BRANCH = "git name-rev --name-only HEAD";
// 1. git symbolic-ref --short -q HEAD
// 2. git rev-parse --abbrev-ref HEAD
// 3. git symbolic-ref HEAD | sed -e "s/^refs\/heads\///"
const COMMIT_DETAIL = 'git log --pretty=format:"%h - %an, %ar : %s"  -5';

let api = args.api ?? "";
let commitId = args.commitId ?? "";
let currentBranch = args.currentBranch ?? "";
let commitDetail = args.commitDetail ?? "";
const buildTime = getBuildTime();

if (api) {
  process.env.API = api;
}

if (!commitId) {
  try {
    commitId = execSync(COMMIT_ID).toString().trim();
  } catch (ex) {
    console.log(ex);
  }
}

if (!commitDetail) {
  try {
    commitDetail = execSync(COMMIT_DETAIL).toString().trim();
  } catch (ex) {
    console.log(ex);
  }
}

if (!currentBranch) {
  try {
    currentBranch = execSync(CURRENT_BRANCH).toString().trim();
  } catch (ex) {
    console.log(ex);
  }
}

function MyGitPlugin(injectKey = "__MY_GIT_PLUGIN__") {
  const gitInfo = JSON.stringify({
    API: api,
    COMMIT_ID: commitId,
    CURRENT_BRANCH: currentBranch,
    COMMIT_DETAIL: commitDetail.split("\n").map((x) => JSON.stringify(x)),
    BUILD_TIME: buildTime,
  });
  return {
    name: "my-git-plugin",
    // apply: 'build', // 在构建时使用
    config() {
      return {
        // 全局变量，可以在整个应用中使用
        define: {
          __API__: JSON.stringify(api),
          // __WS__: JSON.stringify(WS || API.replace('http', 'ws')),
          [injectKey]: gitInfo,
        },
      };
    },
    transformIndexHtml() {
      const HtmlStr = `window.${injectKey} = ${gitInfo}`;
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
  };
}

module.exports = {
  MyGitPlugin,
};
