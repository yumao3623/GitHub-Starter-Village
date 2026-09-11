import type { ChapterModel } from '@/core/game/chapter-games';
/** Scene feedback is derived from the same replayed operations that award progress. */
export function MechanismTrace({ chapter, model, x }: {
    chapter: number;
    model: ChapterModel;
    x: number;
}) {
    const { stage, steps, placed } = model;
    const fixed = stage > 2 || (stage === 2 && steps.some(s => s.startsWith('重连')));
    const broken = chapter === 3 && stage === 2 && steps.length > 0 && !fixed;
    if (chapter === 4)
        return <><div className="scene-searchlight" style={{ background: `radial-gradient(ellipse 180px 250px at ${x}% 62%,transparent 20%,#233e3140 80%)` }} aria-hidden/><div className="mechanism-status"><span>探照灯随少侠移动</span><strong>证据印 {stage === 0 ? steps.length : 5} / 5</strong></div></>;
    if (chapter === 8)
        return <div className="freight-route" aria-label="货物调度状态"><span>上游 u1</span><i className={stage > 1 || steps.length > 0 ? 'active' : ''}>Fetch 取回线索</i><span>本地 {stage > 1 || stage === 1 && steps.length > 1 ? 'u1' : 'u0'}</span><i className={stage > 1 ? 'active' : ''}>Push 已提交货物</i><span>origin {stage > 1 ? 'u1' : 'u0'}</span>{stage === 1 && steps.length > 0 && <b key={steps.length} className="moving-parcel" aria-hidden>卷</b>}</div>;
    if (chapter === 9)
        return <svg className="mechanism-paths" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-label="main 与修复分支分开的路径"><path d="M110 325H1050" stroke="#816e54"/><path d="M280 325Q450 250 590 275T1050 280" stroke={stage > 0 ? '#a6c28f' : '#526a50'} strokeDasharray={stage > 0 ? '' : '8 8'}/><text x="1030" y="320">main · 禁止直接修改</text><text x="570" y="266">{stage > 0 ? '修复分支 · 当前侧路' : '尚未开辟修复侧路'}</text></svg>;
    if (chapter === 10)
        return <div className="mechanism-status commit-status"><span className={stage > 0 ? 'finished' : ''}>工作区：{stage > 0 ? '南门' : '北门'}</span><span className={stage > 2 ? 'finished' : ''}>Stage：{stage > 2 ? 'README 快照' : '空'}</span><span className={stage > 3 ? 'finished' : ''}>Commit：{stage > 3 ? 'c1（模拟编号）' : '尚无'}</span><span className={stage > 4 ? 'finished' : ''}>origin：{stage > 4 ? '已收到 c1' : '等待 Push'}</span></div>;
    if (chapter === 11)
        return <div className="mechanism-status council-status"><span>青砚 · {stage >= 5 ? 'Approve' : stage >= 3 ? 'Request changes' : stage >= 2 ? 'Comment' : '等待议案'}</span><span>讨论 · {stage >= 5 ? '已解决' : stage >= 3 ? '需要修订' : '未开始'}</span><span>冲突 · {stage >= 6 ? '标记已清除' : '待核对'}</span><span>合卷 · {stage >= 7 ? '已合并' : '未合并'}</span></div>;
    if (chapter === 12)
        return <div className="mechanism-status forge-status"><span className={stage > 2 ? 'finished' : stage === 0 && steps.length >= 3 ? 'fault' : ''}>检查炉：{stage > 2 ? 'Passed' : stage === 2 && steps.at(-1)?.includes('Cancelled') ? 'Cancelled' : stage === 0 && steps.length >= 3 ? 'Failed' : '等待指令'}</span><span>Artifact：{stage >= 4 ? '已领取' : '未取得'}</span><span>Tag：{stage >= 5 ? '已铸印' : '未创建'}</span><span>Release：{stage >= 7 ? '已装箱 · Pages 展示就绪' : '等待发行说明'}</span></div>;
    if (chapter === 2)
        return <div className="mechanism-status workshop-output"><span>项目卷余量 {stage === 0 ? 3 - steps.length : 0}</span><span>Fork 产物：{stage > 0 || placed['账号旅人的项目卷'] ? '账号副本' : '等待投料'}</span><span>Clone 产物：{stage > 0 || placed['协作旅人的项目卷'] ? '本地历史' : '等待投料'}</span><span>ZIP 产物：{stage > 0 || placed['阅览旅人的项目卷'] ? '文件快照' : '等待投料'}</span></div>;
    if (chapter === 3)
        return <><svg className={`mechanism-paths circuit ${broken ? 'broken' : ''}`} viewBox="0 0 1200 400" preserveAspectRatio="none" aria-label={broken ? '依赖线断开，服务器熄灭' : '目录、依赖与服务器线路'}><path d="M215 290H470L535 320H710L760 270H940" stroke={fixed ? '#b3d38b' : broken ? '#b55d40' : '#e3cd8d'} strokeDasharray={broken ? '15 18' : ''}/>{[215, 470, 710, 940].map((cx, i) => <circle key={cx} cx={cx} cy={i === 2 ? 320 : i === 3 ? 270 : 290} r="9" fill={stage > 0 && !broken ? '#f2d082' : '#5b684c'}/>)}</svg><div className="mechanism-status"><strong>{broken ? '日志：缺少 Dependency，服务器停止' : fixed ? '线路已恢复 · localhost 亮灯' : '按目录 → 燃料 → 服务器连接'}</strong></div></>;
    if (chapter === 0)
        return <svg className="mechanism-paths" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-label={`路牌已点亮 ${stage > 0 ? 4 : steps.length} 块`}>{[0, 1, 2].map(i => <path key={i} d={`M${216 + i * 236} 284L${452 + i * 236} 305`} stroke={stage > 0 || steps.length > i + 1 ? '#dbc985' : '#756d5066'}/>)}</svg>;
    if (chapter === 1)
        return <div className={`mechanism-status security-seal ${stage >= 3 ? 'sealed' : ''}`}><span>灯笼：{stage === 1 ? `${steps.length} / 3 按序点亮` : stage > 1 ? '域名与入口已核对' : '先辨认入口'}</span><strong>{stage >= 3 ? '拒绝槽封门 · 护身匣已装妥' : '护身匣与拒绝槽分别保管'}</strong></div>;
    if (chapter === 5)
        return <div className="mechanism-status"><span>摊位已翻阅 {stage > 0 ? 3 : steps.length} / 3</span><span>证据已组合 {stage > 1 ? 5 : stage === 1 ? steps.length : 0} / 5</span><strong>{stage === 3 ? '鉴宝铃已响，推荐有证据支持' : 'Stars 不能代替证据卡'}</strong></div>;
    if (chapter === 6)
        return <div className="mechanism-status"><span>四封信：{stage > 0 ? '路线已分开' : `${steps.length} 已分拣`}</span><span>{stage > 1 ? '风铃只收版本信' : '观察通知对象'}</span><span>{stage > 2 ? '需求信已送达各自入口' : 'Issue / Discussion 等待需求信'}</span></div>;
    return <div className="mechanism-status"><span>悬赏榜：{stage > 0 ? '四单已贴签' : `${steps.length} / 4 已贴签`}</span><span>{stage > 1 ? '负责人、里程碑和订阅已安排' : '等待委托分工'}</span><span>{stage > 2 ? '修复记录已归档' : '议题仍待跟进'}</span></div>;
}
