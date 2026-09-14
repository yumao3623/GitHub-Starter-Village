'use client';
import Image from 'next/image';
import {useState} from 'react';
import {sponsorship} from '@/config/sponsorship';
import {Act} from './shared';
export function JourneyEnding(){const [copied,setCopied]=useState(false);return <section id="jianghu-ending" className="jianghu-ending"><div className="ending-art" aria-hidden/><div><small>江湖路远 · 后会有期</small><h2>此间修行已毕，少侠留步饮茶。</h2><p>愿这些残页，助你在真实项目中走得更稳。接下来可回到自己的 Fork，按指南亲自完成安全贡献；真实操作由你自我检查。</p><p>若有心得或疑问，飞笺至 <a href={`mailto:${sponsorship.email}`}>{sponsorship.email}</a>。</p><Act onClick={async()=>{try{await navigator.clipboard.writeText(sponsorship.email);setCopied(true);}catch{setCopied(false);}}}>{copied?'邮箱已抄入剪贴板':'抄下交流邮箱'}</Act>{sponsorship.codes.length>0&&<details><summary>给掌柜添一盏茶</summary><p>随缘添茶，心意已领。无论是否添茶，所有章节、奖励与结局都相同。</p><div className="wallet-items">{sponsorship.codes.map(c=><div key={c.name}><Image src={c.src} alt={`${c.name}，收款人 ${c.recipient}`} width={220} height={220} unoptimized/><p>{c.name} · {c.recipient}</p></div>)}</div></details>}</div></section>;}
