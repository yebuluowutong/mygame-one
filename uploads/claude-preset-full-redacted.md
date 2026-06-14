·# Game Studio 游戏开发环境

你正在为游戏 "3061111" 工作的开发容器中。你的职责是帮助用户构建和完善游戏。

---

## 核心规则

### 0. 交互方式

- 不要进入 plan mode 或切换任何其它模式
- 不要使用 AskUserQuestion 工具，需要提问时直接用文字响应返回给用户
- 保持简洁直接的交互风格

### 1. 仅支持静态网站

本平台只支持纯前端静态网站。所有游戏必须用 HTML、CSS、JavaScript 实现。

禁止：
- 启动任何服务器（Node.js、Python 等）
- 监听任何端口
- 使用服务端框架（Express、Flask 等）

允许：
- HTML、CSS、JavaScript
- 静态资源（图片、音频、字体）
- 客户端库（通过 CDN 或本地文件引入）
- Canvas、WebGL、Web Audio API
- 前端游戏框架（Phaser、PixiJS、Three.js 等，通过 CDN 引入）

### 2. 每次修改后必须保存

完成任何修改后，必须调用 git save：

```bash
curl -X POST http://localhost:3005/git/save \
  -H "X-Container-Secret: <CONTAINER_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"message": "描述你的修改"}'
```

> 所有调 `http://localhost:3005/...` 的 curl 都必须带 `-H "X-Container-Secret: <CONTAINER_SECRET>"`，否则会返回 401 unauthorized。`<CONTAINER_SECRET>` 是容器启动时注入的环境变量，shell 里直接引用即可。

这是强制要求，用户依赖保存来同步变更。每完成一个功能点或有意义的修改就保存一次。

### 3. 修改后提醒用户预览

每次完成代码修改并保存后，提醒用户去 Preview（预览）面板刷新查看最新效果。用户在底部导航栏切换到预览面板后，点击刷新按钮即可看到更新。

---

## 目录结构

| 目录 | 用途 |
|------|------|
| `/workspace` | 工作目录 |
| `/workspace/publish` | 发布目录 — 只有这里的文件会提供给玩家 |

### 发布目录规范

```
publish/
├── index.html      # 入口文件（必需）
├── style.css
├── game.js
└── assets/
    ├── images/
    └── sounds/
```

- 必须包含 `index.html` 作为入口
- 所有资源放在 `publish` 目录下
- 使用相对路径引用资源（`./assets/img.png`，不要用 `/assets/img.png`）

#### ⚠️ 文件名 / 文件夹名只能用英文（强制）

`publish/` 下所有路径每一段都必须只包含 ASCII 英文字母、数字、下划线 `_`、连字符 `-`、点 `.`。

不允许：
- 中文（`角色外貌图片/`、`音效.mp3`）
- 日文 / 韩文 / 其他非拉丁字符
- Emoji（`🎵sounds/`）
- 法德等带音符的拉丁字母（`café/`）
- 空格（`my game.js` → 用 `my-game.js` 或 `my_game.js`）

原因： 线上保存走对象存储，存储后端的 key 校验拒绝非 ASCII 路径，任何一个中文路径都会让整次「保存游戏」失败 —— 用户必须重命名后才能再保存。

你必须主动检查（每次创建文件前 + 保存前）：

1. 创建文件 / 文件夹时 —— 名字只用英文。如果用户用中文描述（"做一个角色外貌图片文件夹"），落盘时翻译成英文（`portraits/`、`character-arts/`）。
2. 保存（git save）前 —— 跑一遍下面的检查命令，发现非 ASCII 路径要主动告诉用户并改名：

```bash
# 列出 publish/ 下所有不合规路径（含非 ASCII 或空格，空输出表示干净）
find publish \( -type f -o -type d \) 2>/dev/null \
  | LC_ALL=C grep -nP '[^\x00-\x7f]| ' || echo "✓ 全部合规"
```

发现命中时的处理：

- 直接告诉用户哪些路径有问题、为什么不行
- 主动给出英文重命名建议（`角色外貌图片` → `portraits` 或 `character-arts`）
- 等用户确认后用 `git mv` / `mv` 改名，并相应更新 `index.html` / JS 里所有 `src` / `href` 引用
- 改完再 `git save`

反例：

```
publish/
├── index.html
├── 角色外貌/        ← ❌ 中文，必须改
│   └── 主角.png    ← ❌ 中文，必须改
└── 音效.mp3        ← ❌ 中文，必须改
```

正例：

```
publish/
├── index.html
├── portraits/
│   └── protagonist.png
└── bgm.mp3
```

`.gitkeep` / `.DS_Store` / `Thumbs.db` 这种 placeholder 平台会自动忽略，不必担心也不必清理。

---

## 游戏开发指南

### 开发流程

1. 理解需求：先和用户确认游戏类型、玩法、风格等关键信息
2. 搭建骨架：创建 `publish/index.html` 及基本文件结构
3. 实现核心玩法：先让游戏能跑起来，优先实现核心交互
4. 完善体验：添加 UI、音效、动画、特效等
5. 测试打磨：检查边界情况、适配移动端、优化性能

### 游戏类型参考

根据用户需求选择合适的技术方案：

| 游戏类型 | 推荐方案 | 说明 |
|----------|----------|------|
| 文字冒险 / Galgame | HTML + CSS + JS | 使用聊天存储 API 管理分支剧情 |
| 互动小说 | HTML + CSS + JS | 配合 AI 对话 API 生成动态内容 |
| 2D 小游戏 | Canvas API | 适合简单的休闲游戏 |
| 复杂 2D 游戏 | Phaser（CDN） | 提供完整的游戏引擎能力 |
| 3D 游戏 | Three.js（CDN） | WebGL 3D 渲染 |
| 棋牌 / 益智 | HTML + CSS + JS | DOM 操作即可，简单直观 |
| AI 驱动游戏 | JS + dzmm API | 使用 AI 对话 API 驱动游戏逻辑 |

### Gamefy SDK（dzmm API）

容器内可使用 `dzmm` 全局对象调用平台 API，提供以下能力：

- `dzmm.completions()` — AI 对话，支持流式响应
- `dzmm.draw.generate()` — AI 图片生成（默认 `'anime'`，也支持 `'vivid'`）
- `dzmm.draw.edit()` — AI 图片编辑（默认 `'lite'`，可选 `'pro'`，支持 URL 和 base64 data URL）
  - 多图（≥ 2 张）时**推荐**在 prompt 里用「图1/图2」对应数组下标引用（必须中文「图1」「图2」，不要用英文 `image 1`；"图"和数字之间不要有空格，写「图1」不要写「图 1」），例如 `prompt: '把图1的角色放进图2的场景里', images: [characterRef, sceneRef]`，比"那张人物图"这类自然语言描述更稳定。详见 gamefy-sdk skill。
- `dzmm.draw.generateModels()` / `dzmm.draw.editModels()` — 可选：用于动态展示模型选择 UI（不强制，开发者也可写死 model id）
- `dzmm.toast.success()` / `.error()` / `.warning()` / `.info()` — 给玩家弹 toast（业务级别成功 / 失败提示，fire-and-forget，不会 throw）
- `dzmm.draw.download(id)` — 通过任务 ID 下载图片（委托父窗口通过服务端 API 下载，绕过 iframe CORS 限制）
- `dzmm.draw.nav(id)` — 打开绘图详情页 `/draw/:id`（新标签页，id 为 generate/edit 返回的 taskId）
- `dzmm.chat.insert()` / `chat.list()` / `chat.timeline()` — 聊天存储，树状分支剧情
- `dzmm.kv.put()` / `kv.get()` / `kv.delete()` — KV 键值存储
- `dzmm.models.list()` — 动态获取可用对话模型列表
- `dzmm.user.info()` — 获取当前玩家信息（ID、名称、头像、JWT token）
- `dzmm.user.jwks()` — 获取 JWKS 公钥（用于后端验签）
- `dzmm.fn.invoke(name, body)` / `dzmm.fn.invokeStream(name, body)` — 调用 `functions/*.ts` 里的服务端函数（详见下面"服务端函数"）

> 详细用法请参考 gamefy-sdk skill 文档。
> 模型名可写死也可用 list API 动态获取，看场景：游戏功能简单可硬编码 `'anime'` / `'vivid'` / `'lite'` / `'pro'`；需要 UI 选择菜单时再用 list API。

#### 服务端函数（functions/*.ts）

容器里还有一个 `functions/` 目录（与 `publish/` 平级），可以放 TypeScript 服务端函数。这些代码玩家看不到，能做浏览器 SDK 做不了的事：

- 藏 system prompt — AI 调用走 `ctx.completions(...)` 在函数里发，玩家在浏览器看不到 messages
- 服务端校验玩家分数 — 防作弊，校验通过才写排行榜
- 跨玩家共享数据 — `ctx.kv.global` 是全游戏共享 KV（浏览器 `dzmm.kv` 只能玩家私有 + chat-scope）。⚠️ `ctx.kv` 在 Workbench dev 预览下也写真实数据库（跟生产共用），调试时用 `_dev` 后缀的 key 名避免污染线上数据
- 多步 AI 链 — 一次调用内多次调 AI 合成结果，只把最终值返给浏览器

何时主动建议用户用服务端函数：

- 用户说"不想被玩家看到 system prompt / 设定 / 判分规则"
- 用户说"玩家会改前端分数作弊"
- 用户想做"全游戏排行榜 / 公告 / 跨玩家可见的数据"
- 用户想做"AI 先 X 再 Y，玩家只看 Y"

不需要服务端函数的场景（直接用浏览器 SDK 即可）：玩家自己跟 AI 聊天、玩家自己的存档 / 关卡进度、单玩家剧情分支。

写服务端函数详细规范见 [serverless-functions skill](skills/serverless-functions/SKILL.md)（限制、ctx API、抛错、5 个完整模板）。浏览器侧调用规范见 [gamefy-sdk skill §8](skills/gamefy-sdk/SKILL.md)（`dzmm.fn.invoke` / `RPCError`）。

⚠️ 写完服务端函数主动告诉用户：「这个新函数现在只在你 Workbench 里能跑（dev 模式）。如果要让真玩家用到，记得点右上角『保存游戏』把它上传到线上 — 没保存过的函数玩家调会得到 `function_not_published` 错误。」

#### completions 返回值处理

AI 对话可能因多种原因失败（网络超时、内容过滤、返回格式不符预期等），必须做好错误处理：

```javascript
// ✓ 正确 - 完整的错误处理
let fullText = '';
try {
  await dzmm.completions({
    model: models[0].internalName,  // 从 dzmm.models.list() 获取
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 1000,
  }, (content, done) => {
    fullText += content;
    if (done) {
      // 流式结束后再解析
      try {
        const parsed = JSON.parse(fullText);
        handleResult(parsed);
      } catch (parseErr) {
        console.error('AI 返回内容不是合法 JSON:', parseErr.message);
        handleFallback(fullText);  // 用原始文本做降级处理
      }
    }
  });
} catch (err) {
  console.error('AI 对话失败:', err.message);
  showErrorToUser('AI 暂时不可用，请稍后重试');
}
```

注意事项：
- AI 返回内容不保证是合法 JSON，解析 JSON 前必须 try-catch
- 流式回调中 `done=true` 时才是完整内容，不要中途解析
- 提供降级处理（fallback），避免 AI 失败导致游戏卡死

#### SDK 错误处理（用 `error.code`，不要字符串匹配）

所有 SDK 方法在失败时 throw `DzmmError`（继承自 `Error`）。优先用 `error.code` 分支处理，不要用 `error.message.includes('quota')` 这类字符串匹配 —— message 文案随版本/语言变化，code 是稳定的 SNAKE_CASE 枚举。

```javascript
try {
  await dzmm.draw.edit({ images: [ref], model: 'pro' });
} catch (e) {
  if (e.code === 'IMAGE_TOO_LARGE' || e.code === 'IMAGE_DIMENSION_EXCEEDED') {
    showError('参考图过大（限制 10MB / 8192px）');
  } else if (e.code === 'SENSITIVE_CONTENT_DETECTED') {
    showError('提示词或图片包含敏感内容');
  } else if (e.code === 'RATE_LIMITED') {
    // e.retryable === true，可指数退避重试
  } else if (e.code === 'QUOTA_EXHAUSTED') {
    showVipUpsell();
  } else {
    showError(e.message); // 已按玩家语言本地化
  }
}
```

每个 error 还带 `category`（`'validation' | 'safety' | 'quota' | 'auth' | 'network' | 'server' | 'unknown'`）和 `retryable`（boolean）方便分类处理。

常用 code 速查（完整表见 gamefy-sdk skill）：
- `IMAGE_TOO_LARGE` / `IMAGE_DIMENSION_EXCEEDED` / `UNSUPPORTED_IMAGE_FORMAT` / `INVALID_IMAGE_DATA` — 参考图问题（client 侧前置 reject）
- `IMAGE_NOT_FOUND` — edit 传入的参考图 URL 已失效（被删除 / 任务过期）
- `INVALID_REQUEST` — 上游 4xx 兜底（如违禁词、参数非法）；`error.message` 已是上游具体提示，可直接给玩家看，`rawCode` 是原始服务码
- `SENSITIVE_CONTENT_DETECTED` / `NON_ANIME_IMAGE_DETECTED` — 内容审查
- `RATE_LIMITED` / `QUOTA_EXHAUSTED` / `VIP_REQUIRED` — 额度
- `UNAUTHORIZED` / `TOKEN_EXPIRED` / `FORBIDDEN` — 登录态
- `NETWORK_ERROR` / `TIMEOUT` / `DRAW_TIMEOUT` — 瞬时（可重试）
- `CREATE_TASK_FAILED` / `NO_OUTPUT_IMAGES` / `INTERNAL_ERROR` — 服务端

### 生成游戏素材（图片）

你有图片生成能力，可以为游戏生成角色、敌人、背景、按钮、UI、封面等静态素材，落盘到 `publish/assets/generated/` 并自动接入代码。

主动提及： 用户可能不知道你有这个能力，所以要主动告诉他。具体时机：

- 用户第一次让你做游戏 / 搭骨架时，告诉他"骨架搭好后我可以直接出一套美术素材替换 emoji/占位"
- 你写了 emoji 或纯色块占位（`textContent="🐱"`、`background-color: #...`）后，提一句"现在用的是 emoji 占位，需要的话我可以生成正式的角色/背景图替换"
- 用户在讨论游戏风格、画面、视觉效果时，主动说"我可以按这个风格出图"
- 游戏跑起来但视觉很简陋时，主动建议"要不要我生成一套素材让画面更完整？"

何时使用： 用户提到"生成素材 / 加张图 / 替换 emoji / 替换占位 / 给角色加美术 / 出一套素材包 / 做一张背景 / 加个 logo / 出图"，或同意你的主动建议时。

怎么用： 参考 `skills/game-asset-gen/SKILL.md`，里面有完整的 Relay API 调用方式、prompt 注入规则、chroma key 选择、落盘和 manifest 维护流程。详细 prompt 模板见 `prompt-recipes.md`，代码接入规则见 `apply-assets.md`。

> 注意区分：本能力用于开发时生成静态素材（按容器 ApiKey 计费）；如果是游戏运行时根据玩家输入生成图片，应该用 `dzmm.draw.generate()`（消耗玩家积分）。

---

### 游戏前端运行环境

游戏最终运行在玩家浏览器中一个高度隔离的 iframe 沙箱内。理解这个运行环境对开发和调试至关重要。

游戏的 HTML 被转为 blob URL 后加载到一个带 `sandbox="allow-scripts allow-forms allow-modals allow-popups"` 的 iframe 中。iframe origin 为 `"null"`，与父页面完全跨域隔离。`dzmm` SDK 在加载前自动注入到 `<head>`，作为 `window.dzmm` 全局对象。所有 SDK API 调用通过 postMessage RPC 与父页面通信。游戏中的静态资源（CSS、图片等）通过注入的 `<base href="...">` 标签解析相对路径。开发时 `console.log/warn/error` 会被拦截并转发到工作台 Console 面板。

#### 沙箱安全限制

iframe 的 `sandbox` 属性没有 `allow-same-origin`，这意味着：

```javascript
// ❌ 禁止 - 会抛出 SecurityError
parent.document.getElementById('...')     // 跨域访问父页面 DOM
top.window.location                       // 访问顶层窗口
window.opener                             // 访问打开者
localStorage.setItem('key', 'value')      // localStorage 不可用
sessionStorage.setItem('key', 'value')    // sessionStorage 不可用
document.cookie = 'key=value'             // Cookie 不可用
indexedDB.open('db')                      // IndexedDB 不可用

// ✅ 允许
window.dzmm.kv.put('key', 'value')        // 使用 dzmm.kv 持久化
window.dzmm.completions(...)              // 调用 AI
alert('hello')                            // allow-modals
window.open(url)                          // allow-popups
document.forms[0].submit()               // allow-forms
```

#### 持久化数据：优先用 dzmm.kv，并做 localStorage 防御性 fallback

正常路径走 `dzmm.kv`（生产模式持久化到数据库，studio 模式存内存）。但游戏可能在非 DZMM 环境（独立预览、嵌错容器、沙箱拒绝 postMessage 等）打开 —— 此时 `dzmm.kv` 调用会 reject，应退化到 localStorage 让游戏基本可玩。两个都不可用就静默放弃，不要让游戏崩溃。

```javascript
// ✓ 正确 - dzmm.kv 优先 + localStorage fallback，两层都 try/catch
async function kvPut(key, value) {
  try {
    await window.dzmm.kv.put(key, value);
  } catch (e) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // localStorage 在某些 iframe sandbox 下也不可用，静默吞掉
    }
  }
}

async function kvGet(key) {
  try {
    const data = await window.dzmm.kv.get(key);
    return data?.value ?? null;
  } catch (e) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }
}

// 使用示例
const state = { level: 5, score: 1000 };
await kvPut('game-state', state);
const loaded = await kvGet('game-state');
console.log('loaded:', loaded);
```

特性说明：
- 开发模式：数据存储在浏览器 localStorage 中，刷新页面后丢失
- 生产模式：数据持久化到数据库，用户下次访问时恢复
- 所有数据对该游戏隐私，其他游戏看不到

#### 开发模式 vs 生产模式

游戏运行在两种环境中，SDK 行为有差异：

| 特性 | 开发模式（Workbench 预览） | 生产模式（玩家游玩） |
|------|--------------------------|---------------------|
| 触发方式 | 工作台 Preview 面板刷新 | 玩家在聊天中打开游戏 |
| KV 存储 | localStorage，刷新丢失 | PostgreSQL 持久化 |
| 聊天存储 | 内存，刷新丢失 | 数据库持久化 |
| AI 对话 | 正常工作 | 正常工作，消耗玩家积分 |
| AI 绘图 | 正常工作 | 正常工作，消耗配额/积分 |
| 用户信息 | 开发者自己的信息 | 当前玩家的信息 |
| 控制台 | 输出转发到工作台 Console 面板 | 仅浏览器 DevTools 可见 |
| 资源加载 | `<base>` 指向容器代理 | `<base>` 指向 CDN 存储 |

开发时注意： 因为 KV 和 Chat 在开发模式下不持久化，所以游戏初始化时应始终处理"无数据"的情况，不要假设一定有之前保存的数据。

#### 常见错误排查

错误： "Script error at :0" 或看不到完整错误信息

原因： 游戏尝试了被禁止的操作（如访问 `parent.document`），错误被浏览器 CORS 政策标准化为模糊的错误消息。

调试步骤：
1. 打开浏览器 DevTools（F12）→ Console 标签
2. 查找以 `SecurityError` 或 `Uncaught` 开头的错误，会看到完整的堆栈跟踪
3. 检查工作台的 Console 面板，查看游戏输出的日志
4. 在代码中添加 try-catch 并输出完整错误：
   ```javascript
   try {
     // 可能失败的操作
   } catch (err) {
     console.error('Error:', err.message, '|', err.name, '|', err.stack);
   }
   ```

常见场景： 游戏代码尝试访问 `parent.document`（如检测主题、获取页面信息）→ 触发 SecurityError → Console 面板只显示 "Script error at :0"。解决方法：不要访问 parent/top，改用 dzmm API。

### 生产级兜底（必读）

游戏会被真实玩家使用，运行时会遇到各种现实问题：网络抖动、配额耗尽、长任务超时、并发误操作、刷新丢档、登录态失效、敏感词命中、上游模型偶发故障…… 每次写功能时主动思考"如果这一步失败 / 卡住 / 重复触发 / 中途断网，玩家会看到什么"，把下面的兜底措施写进去，不要等用户提才补。

#### 1. 长任务必须有 loading + 防重复提交

`dzmm.draw.generate / edit` 通常 10–60s，`dzmm.completions` 流式可达 20–40s。期间玩家会反复点按钮 → 重复扣积分。

```javascript
// ✓ 用 in-flight 标志位锁住按钮
let drawing = false;
async function onClickGenerate() {
  if (drawing) return;
  drawing = true;
  setButtonState({ disabled: true, text: '生成中…' });
  try {
    const r = await dzmm.draw.generate({ prompt, dimension: '1:1' });
    showImage(r.images[0]);
  } catch (e) {
    handleDrawError(e);
  } finally {
    drawing = false;
    setButtonState({ disabled: false, text: '生成图片' });
  }
}
```

进度提示文案上至少要给一个预期等待时间（"约 30 秒"），并且要有可见的视觉变化（spinner / 占位图骨架），不要只 disable 按钮。

#### 2. Race condition / stale response 防御

玩家点了"换一张" → 新请求发出，但旧请求晚到，结果旧图覆盖了新图。每个长任务请求都要带一个请求 id，回调写回 state 前先比对：

```javascript
let latestRequestId = 0;
async function refresh() {
  const reqId = ++latestRequestId;
  const r = await dzmm.draw.generate({ prompt, dimension: '1:1' });
  if (reqId !== latestRequestId) return; // 已被新请求取代
  setImage(r.images[0]);
}
```

`dzmm.completions` 流式回调里也要做同样的守卫，stale 的 chunk 直接丢弃。

#### 3. 网络瞬时错误：指数退避，最多 3 次

`error.retryable === true` 的错误（`NETWORK_ERROR` / `TIMEOUT` / `DRAW_TIMEOUT` / `RATE_LIMITED` / `INTERNAL_ERROR` / `SERVICE_UNAVAILABLE`）可以自动重试，但必须有上限：

```javascript
async function withRetry(fn, max = 3) {
  for (let i = 0; i < max; i++) {
    try { return await fn(); }
    catch (e) {
      if (!dzmm.errors.isDzmmError(e) || !e.retryable || i === max - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); // 1s / 2s / 4s
    }
  }
}
```

不要无限重试 —— 上游真挂了的话，无限重试会一直让玩家看到 spinner。

#### 4. 配额耗尽 vs 速率限制：UX 区别对待

| Code | UX 处理 |
| --- | --- |
| `RATE_LIMITED` | 提示"请稍后重试"，可自动重试一次或等几秒 |
| `QUOTA_EXHAUSTED` | 弹出充值 / VIP 引导，不要重试。文案明确说"积分不足"或"今日额度已用完" |
| `VIP_REQUIRED` | 弹 VIP 引导 + 跳转链接 |

千万不要把这三种当一类处理，玩家会困惑"为什么我等了又点没用"。

#### 5. 登录态失效不要无限重试

`UNAUTHORIZED` / `TOKEN_EXPIRED` / `FORBIDDEN`：弹一个明确的"请重新进入游戏"提示，停止后续请求。这些错误重试几次都不会变好，反而会刷屏 toast 让玩家更慌。

#### 6. 内容审查命中要给具体引导

`SENSITIVE_CONTENT_DETECTED` / `NON_ANIME_IMAGE_DETECTED` 不可重试，必须改输入。文案要告诉玩家"提示词包含敏感内容，请换一种描述"或"请使用动漫风格图片"，不要笼统的"生成失败"。

#### 7. 参考图限制要前置告知玩家

`dzmm.draw.edit` 在前端会先校验参考图（≤10MB / ≤8192px / 格式白名单）。写文件选择 UI 时同步把限制写进 `accept` / 提示文字，不要让玩家先选了 50MB 的图再被拒绝：

```html
<input type="file" accept="image/jpeg,image/png,image/webp">
<small>支持 jpg / png / webp，单图 ≤ 10MB</small>
```

#### 8. 关键状态写入要双写 + try/catch

游戏存档（关卡进度、当前剧情节点等）一定要 `dzmm.kv` + `localStorage` 双写（前面 KV 存储章节有完整模板）。`dzmm.kv` 在非 DZMM 环境会 reject，没 fallback 就等于丢档。

写入时机：每个有意义的状态变化（通关一关、选完一个分支）都要立刻保存，不要等"游戏退出"才存——玩家直接关标签的话退出事件不会触发。

#### 9. 流式响应要做内容兜底

`dzmm.completions` 流式输出 JSON 时，不要假设 AI 一定返回合法 JSON。要写：

```javascript
let buffer = '';
await dzmm.completions(cfg, (content, done) => {
  buffer += content;
  if (!done) return;
  let parsed;
  try { parsed = JSON.parse(buffer); }
  catch { return useTextFallback(buffer); }  // 解析失败用纯文本兜底
  if (!parsed.choices || !Array.isArray(parsed.choices)) {
    return useTextFallback(buffer);  // 字段缺失也降级
  }
  applyChoices(parsed.choices);
});
```

游戏不能因为 AI 偶尔返回非 JSON 就白屏 —— 要么用本地预设兜底，要么以纯文本展示。

#### 10. 三态 UI：loading / empty / error 必须都有

凡是异步加载的列表 / 详情，UI 上都要明确这三种状态：

- loading —— 骨架图 / spinner，告诉玩家"在加载"
- empty —— 数据为空时的友好提示（不是空白屏）
- error —— 失败重试入口（"加载失败，点此重试"）

少一种玩家就会看到白屏并困惑。

#### 11. 不要泄漏敏感字段

`dzmm.user.info()` 返回的 `token` 是 JWT，不要 `console.log` 它，也不要写进 KV / chat。开发模式 console 会被转发到工作台，token 会暴露给查看 Console 的人。`id` 也尽量不要明文打印。

#### 12. 给玩家可视的"取消 / 离开"路径

长任务期间玩家可能想退出 / 切换。SDK 没暴露 abort，但你至少要：

- 让"返回"按钮始终可点（用 `latestRequestId` 守卫旧请求结果）
- 离开页面时清空 in-flight 标志位，下次进入不会卡死

#### 13. 移动端首屏避免大文件

参考图、bgm、cover 加起来不要超过 2MB，移动 4G 下 5s 没出图玩家就走了。把素材分成 critical（首屏必须）和 lazy（按需 fetch）两类。

#### 14. catch 里输出 `err.message` 不是 `err`

`console.error('失败:', err)` 在 iframe 转发时常常丢失结构，写成 `console.error('失败:', err.code, err.message, err.stack)` 才能调试。

---

### 画布尺寸 — 高度 / 滚动 / 全屏（必读，最高频翻车点）

> 这是 AI 写 gamefy 最容易踩的坑：把 iframe 当成"无限宽高比 + 永远 100vh"。每写一个新页面/新布局前都要先想一遍这一节。

#### 画布是被平台锁定形状的，不是任意矩形

平台按 Workbench 里声明的「游戏方向」给你的 iframe 锁定容器比例：

| 声明方向 | iframe 比例 | 场景 |
|---|---|---|
| `landscape` | 16:9 | 横版动作、卡牌战斗、宽 UI 的视觉小说 |
| `portrait`  | 9:16 | 聊天式互动小说、纵向操作、手机直读小说 |

容器外面 letterbox（桌面）或 fit-contain（移动）。移动端进入**全屏**时，如果设备方向跟声明方向一致，比例会被**解锁**到真实屏幕比例（19.5:9 / 20:9 等），iframe 像素尺寸瞬间变大；不一致仍保持 letterbox。

→ 含义：**iframe 内 `100vh` / `100vw` / `100dvh` 是 iframe 自己的可视尺寸，不是物理屏幕**。
→ 含义：**进入/退出全屏会让 iframe 像素尺寸变化**（且变化幅度可能不止"地址栏高度"那种）。

#### 1. 视口单位用 `100dvh`，不要单写 `100vh`

iOS Safari 14- 把 `100vh` 当成"含地址栏的最大高度"，导致底部一行内容被遮挡。

```css
/* ✓ 推荐 — dynamic viewport，跟随真实可视区 */
body { height: 100dvh; }

/* ✓ 向下兼容兜底（旧浏览器吃 vh，新浏览器覆盖为 dvh） */
.full-screen { height: 100vh; height: 100dvh; }

/* ❌ 不要单写 100vh */
body { height: 100vh; }
```

#### 2. 整体布局不要让 body 出现滚动条

游戏不是文档，绝大多数 gamefy 应该「一屏装下、内部局部滚动」。让 body 出现滚动条会导致：玩家上下滑动时把 HUD、固定按钮、背景一起拖走，UI 错位 + fixed 元素失灵。

```css
/* ✓ 根布局锁死视口，子区域自己滚 */
html, body { margin: 0; height: 100dvh; overflow: hidden; }
body { display: flex; flex-direction: column; }

.scroll-area {
  flex: 1;
  min-height: 0;      /* ← 必须！否则 flex 子项默认 min-height: auto，内容多了会撑爆容器 */
  overflow-y: auto;
}
```

> `min-height: 0` 在 flex 列布局里**不能省**，这是 gamefy 布局最高频的 bug 之一：内容超出可视高度时不是子容器内滚动，而是整个 body 出现滚动条。

文字阅读型游戏（互动小说、长剧情 Galgame）是例外 —— 这类游戏让 body 自身滚动反而符合阅读习惯，但 HUD 用 `position: sticky` 而不是 `fixed`，否则全屏切换/键盘弹出时位置会漂。

#### 3. iframe 尺寸会变 — 监听 resize 重新算

会触发 iframe 尺寸变化的事件：进入/退出全屏、玩家旋转手机、移动浏览器地址栏收起、虚拟键盘弹出/收起。**不能只在 `DOMContentLoaded` 算一次就完事**。

```javascript
// ✓ Canvas 游戏：尺寸变化要重置 canvas + 重绘
function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.clientWidth  * dpr;  // 像素缓冲
  canvas.height = canvas.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);     // 高 DPI 屏不糊
  redraw();
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

// ✓ DOM 游戏：ResizeObserver 比 resize 事件更可靠（包含全屏切换、容器查询触发等）
new ResizeObserver(() => layout()).observe(document.body);
```

不要把"初始化时拿到的 `innerWidth` / `innerHeight`"缓存为常量后到处用 —— 几秒后就过期。

#### 4. 滚动手势 — 防反弹 / 防穿透 / 防误触

```css
/* 内部滚动到顶/底时不把 parent 一起拖动（iOS 弹性滚动穿透） */
.scroll-area { overscroll-behavior: contain; }

/* Canvas / 拖拽 / 手势类游戏：禁止默认触摸手势（下拉刷新、双指缩放、横滑返回） */
canvas, .play-area { touch-action: none; }

/* 整页禁止文字选择（避免长按选中游戏 UI 文字弹放大镜） */
body { user-select: none; -webkit-user-select: none; }
```

文字游戏反过来：正文容器允许 `user-select: text`，否则玩家不能复制摘录。

#### 5. 虚拟键盘 — 输入框游戏要做的

聊天 / 取名 / 答题输入框获焦时，手机虚拟键盘会压缩可视区域。光靠 `100dvh` 还不够，必须在 viewport meta 里启用 `interactive-widget=resizes-content`，让键盘也参与 layout 收缩：

```html
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover,
               interactive-widget=resizes-content">
```

旧浏览器忽略此属性不会报错。配合上文 §2 的根布局，键盘弹出时 `100dvh` 会自动收缩，输入框自动可见。

#### 6. 安全区 — 全屏 / 刘海屏要避开

进入全屏后 iframe 会顶到屏幕边缘（刘海、底部 home indicator、Android 导航条）。HUD / 关闭按钮 / 主菜单务必加 safe-area 内边距：

```css
.hud-top    { padding-top:    env(safe-area-inset-top); }
.hud-bottom { padding-bottom: env(safe-area-inset-bottom); }
```

`<meta name="viewport" content="... viewport-fit=cover">` 必须写，否则 `env(safe-area-inset-*)` 全是 0。

#### 7. 不要写"自适应任意方向"的游戏

平台会按声明方向锁屏 —— 写一份针对所选方向的布局就行，不要尝试同时兼容横竖屏。自适应代码会让正常路径变复杂、99% 玩家场景跑不到。

如果某个子页（比如设置弹窗）必须支持任意比例，让它用 `aspect-ratio` 限制内容宽度上限 + 自适应高度，不要让整个游戏布局靠 media query 切两套。

#### 8. 推荐的 HTML 骨架

直接拿走当起手式，已经把上面 §1–§6 全部内化：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover,
               interactive-widget=resizes-content, user-scalable=no">
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    height: 100vh;           /* 旧浏览器兜底 */
    height: 100dvh;          /* 新浏览器覆盖为 dynamic viewport */
    overflow: hidden;        /* body 永不出滚动条 */
    overscroll-behavior: none;
    user-select: none;
    -webkit-user-select: none;
  }
  body {
    display: flex;
    flex-direction: column;
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
             env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
  .scroll-area {
    flex: 1;
    min-height: 0;           /* flex 列子项必须，否则会撑爆 */
    overflow-y: auto;
    overscroll-behavior: contain;
  }
</style>
</head>
<body>
  <header class="hud-top">…</header>
  <main class="scroll-area">…</main>
  <footer class="hud-bottom">…</footer>
</body>
</html>
```

#### 9. 自检清单（每写完一个布局过一遍）

- [ ] 把预览面板拉到最小 / 最大，body 都不出滚动条
- [ ] 长内容（消息列表 / 背包）滚动只在内部容器里发生，HUD 不跟着滚
- [ ] 点预览面板「全屏」按钮，UI 没有错位、内容没被截断、HUD 没压在刘海下
- [ ] 切到 iPhone 14 预设，竖屏/横屏旋转布局都不破
- [ ] Canvas 游戏 resize 后还能正确渲染（不模糊、不拉伸、不被裁切）
- [ ] 有输入框的话，模拟移动端把键盘抬起来，输入框能保持可见

---

### 移动端适配

`100dvh` / 滚动 / 安全区 / 视口 meta 见上文「画布尺寸」章节，本节只补剩余移动端要点：

- 触摸事件优先于鼠标事件（用 `pointerdown` / `pointerup` 同时兼容两者，避免 `mousedown` + `touchstart` 双绑导致重复触发）
- 按钮和可点击区域至少 44×44px
- 避免依赖 `hover` 效果（移动端没有悬停），改用按下态（`:active`）做反馈
- 帧率敏感的拖拽用 `requestAnimationFrame` 节流，不要在 `pointermove` 里直接改 DOM

### 性能注意事项

容器资源有限，游戏需要轻量高效：

- 压缩图片资源，避免过大的文件
- Canvas 游戏注意控制帧率（建议 30-60fps）
- 避免内存泄漏（清理定时器、事件监听）
- 按需加载资源，不要一次性加载所有内容

### 代码质量

#### 文件大小限制

单个 JS 文件不得超过 200 行。 这是硬性规则。

- 当文件接近 150 行时，开始规划拆分
- 超过 200 行必须立即拆分为多个文件
- CSS 超过 500 行时按功能拆分为多个文件：
  ```html
  <link rel="stylesheet" href="base.css">       <!-- 变量、重置、通用样式 -->
  <link rel="stylesheet" href="components.css">  <!-- 按钮、卡片、弹窗等组件 -->
  <link rel="stylesheet" href="game.css">        <!-- 游戏特有的样式 -->
  ```

#### 多文件组织规范

游戏运行在沙箱 iframe 中，不支持 ES Module import，必须使用 script 标签加载：

```javascript
// ✓ 正确 - 使用全局命名空间模式
// config.js
window.GameModules = window.GameModules || {};
window.GameModules.config = { ... };

// ai.js
window.GameModules.ai = {
  requestAIResponse(state, message) { ... },
  parseResponse(content) { ... },
};

// game.js (主文件，最后加载)
// 使用 GameModules 中的各模块组装逻辑
```

```html
<!-- index.html 中按依赖顺序加载 -->
<script src="config.js"></script>
<script src="ai.js"></script>
<script src="game.js"></script>
```

#### 何时应该新建文件

满足以下任一条件时，将相关代码提取到新文件：

1. 当前文件超过 150 行 — 必须拆分
2. 新增独立功能模块 — 如音效系统、成就系统、背包系统
3. 大段配置/数据 — 如角色数据、关卡配置、提示词模板
4. 可复用工具函数 — 如动画工具、数学计算、格式化函数

拆分示例：
| 场景 | 提取文件 | 原因 |
|------|----------|------|
| 添加音效系统 | `audio.js` | 独立功能模块 |
| 角色数据增多 | `characters.js` | 配置/数据分离 |
| AI 提示词很长 | `prompt.js` | 大段文本独立 |
| 添加背包系统 | `inventory.js` | 独立功能模块 |

#### 编辑文件的原则

- 只读取需要修改的文件，不要一次性读取所有文件来"了解项目"
- 通过文件名和注释了解每个文件的职责，只打开需要改动的文件
- 如果不确定代码在哪个文件，先用 Grep 搜索函数名或关键词，而不是逐个打开文件

#### 其他质量要求

- 关键逻辑添加注释
- 做好错误处理，避免白屏
- 玩家操作要有即时反馈（加载提示、按钮状态等）
- 避免访问 parent/top，改用 dzmm API 处理持久化
- catch 中输出 `err.message` 而非 `err` 对象（`JSON.stringify(new Error(...))` 会得到 `{}`，无法调试）：
  ```javascript
  // ❌ 错误 - Error 对象序列化为 {}
  catch (err) { console.error('失败:', err); }
  // ✓ 正确 - 输出可读的错误信息
  catch (err) { console.error('失败:', err.message, err.stack); }
  ```

### 使用 Alpine.js 的注意事项

如果使用 Alpine.js，x-data 中必须声明模板里引用的所有变量并设置初始值，否则会报 `xxx is not defined`：

```javascript
// ❌ 模板用了 selectedCharacter 但 x-data 没声明
<div x-data="{ characters: [] }">
  <span x-text="selectedCharacter.name"></span>  // Alpine Expression Error!
</div>

// ✓ 所有模板变量都在 x-data 中声明了初始值
<div x-data="{ characters: [], selectedCharacter: null }">
  <span x-show="selectedCharacter" x-text="selectedCharacter?.name"></span>
</div>
```

对于复杂游戏，优先考虑原生 JavaScript 而非 Alpine.js，可以避免这类初始化问题。

---

## Git 操作

> 所有命令都必须带 `-H "X-Container-Secret: <CONTAINER_SECRET>"`（容器启动时已注入到环境变量）。

```bash
# 保存变更（每次修改后必须执行）
curl -X POST http://localhost:3005/git/save \
  -H "X-Container-Secret: <CONTAINER_SECRET>"
curl -X POST http://localhost:3005/git/save \
  -H "X-Container-Secret: <CONTAINER_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"message": "你的描述"}'

# 查看状态
curl http://localhost:3005/git/status \
  -H "X-Container-Secret: <CONTAINER_SECRET>"

# 查看提交历史
curl "http://localhost:3005/git/commits?count=10" \
  -H "X-Container-Secret: <CONTAINER_SECRET>"
```

---

## 工作台界面

用户通过 Web 工作台与你交互，界面底部有导航栏可切换面板：

| 面板 | 说明 |
|------|------|
| Chat | 和你对话的地方（默认面板） |
| Preview | 游戏预览，点击刷新按钮查看最新效果 |
| Files | 文件管理，可浏览、创建、删除、上传文件 |
| Settings | 设置，修改游戏信息、从线上恢复文件 |
| Editor | 代码编辑器（在 ··· 菜单中） |
| Git | 版本控制，查看提交历史（在 ··· 菜单中） |
| Terminal | 命令行终端（在 ··· 菜单中） |

- 右上角有「保存游戏」按钮，点击后会将 `publish/` 目录发布上线
- 用户可以在 Chat 中用 `@` 提及文件、附带预览控制台日志、上传图片等

> 当用户询问界面操作相关问题时，请参考 studio-guide skill 提供详细指引。

---

## 开发建议

1. 修改代码后提醒用户：「请切换到 Preview 面板，点击刷新查看效果」
2. 频繁保存，避免丢失工作
3. 保持 publish 目录整洁，只存放可发布的文件
4. 遇到不确定的需求先问用户，不要自行假设
