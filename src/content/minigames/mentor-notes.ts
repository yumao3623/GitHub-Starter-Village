/** Optional permanent chapter notes, unlocked with copper. Free next-step guidance remains available. */
export const mentorNotes: readonly (readonly string[])[] = [
 ['先把“读说明”的旅人交给 README，再把“看文件”的旅人交给 Code tab。Releases 是成品包；Fork 是自己账号下的副本。', '四位旅人到达后才选下方路线。想改代码：README → 自己的 Fork → Clone；只想运行成品：README → Releases → macOS 附件。'],
 ['先展开来信，看来源和用途。官方入口只辨认名称；密码、Token、私钥和恢复码均由本人保管。', '遇到向游戏、群聊或陌生站点提交秘密的请求，放入拒绝槽。'],
 ['先读订单要“自己的账号”“电脑”还是“云端”，再选工艺并安排空工位。Fork 到账号；Clone 或 ZIP 到电脑；Codespaces 到云端。', 'SSH 公钥认证是连接方式，SSH 私钥仍属于秘密。工位完成交付后才能接下一单。'],
 ['先在 Terminal 选择 project，核对 Node 22 / npm，再旋转接头到标注方向。安装依赖后才能启动。', '若 localhost 不通，先展开日志；端口占用时停止模拟占用进程，再启动。最后别忘 Ctrl+C。'],
 ['上层册页取走后，下层才露出。四格托盘装满时可退回不相关的册页，不会删除仓库文件。', 'Public 只说明可见性，能否使用还要看 License。比较版本时，main 会继续前进，Tag 和 Release 对应指定版本。'],
 ['看项目是否满足委托，再花调查次数读关键证据。Stars 只能表示关注，不能证明可用、可信或适合本机。', '彩头可以选零。把许可证、维护状况与运行条件对照委托后再选项目。'],
 ['每封信先读用途，再决定送往哪个入口。Watch 管通知，Issue 管问题，Pull Request 管拟合并的改动。', '暂停飞笺不会扣分。过滤规则影响以后送来的信；改错规则可以撤销。'],
 ['用标题概括具体故障，正文分别写操作步骤、期望和实际结果。先搜索相似 Issue。', '复现记录齐备再提交模拟 Issue；这是游戏内练习，不会发到真实仓库。'],
 ['先核对 upstream、origin 与本地的版本。Fetch 只更新追踪记录；Pull 才把改动带到当前分支。', '网页 Sync fork 更新的是自己的远端副本，电脑不会自动跟着变。Push 送往自己的 origin。'],
 ['Create branch 创建分支后，仍要 Switch 才能切换。改动会覆盖未提交便条时，先妥善处理便条。', '在修复分支修改，不直接改 main。记住分支从哪个提交分出，之后合卷台要继续使用它。'],
 ['先取签读 Diff，只暂存当前委托相关的文件。私人便条和无关主题修改留在工作区。', 'Stage 保存当时的快照。暂存后再次修改 README，要重新 Stage 才能提交最新版；Commit 后再 Push 并核对 SHA。'],
 ['先核对 base 与 head，再查看变更和评审意见。存在冲突时逐处保留正确内容，删除冲突标记。', '冲突修复会改变提交，旧批准不能代替对新提交的评审。检查通过、批准有效，才可模拟 Merge。'],
 ['依次连接 check → build → deliver。失败时展开 Step 日志，修复后提交并 Push 新版本。', 'Re-run 仍使用旧 SHA；修复后要 Run workflow 新运行。发布前核对 Artifact、Tag 与说明指向同一版本。'],
];
