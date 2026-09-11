import { PlacedCharacter } from './character-placement';
/** Original vector scenery; shared motifs are placed at the chapter's actual map location. */
export function SceneEnvironment({ chapter }: {
    chapter: number;
}) {
    const left = [0, 2, 3, 4, 5, 7, 10, 11, 12].includes(chapter);
    return <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className={`scene-environment environment-${chapter}`} aria-hidden>
 <defs><pattern id={`planks-${chapter}`} width="54" height="15" patternUnits="userSpaceOnUse"><rect width="54" height="15" fill="#b5976d"/><path d="M0 0H54M0 0V15" stroke="#816642" opacity=".35"/></pattern></defs>
 <path d="M0 335Q250 300 510 335T1200 327V400H0Z" fill="#baa37dcc"/><path d="M0 337Q250 302 510 337T1200 329" fill="none" stroke="#eee0b4" strokeWidth="5"/>
 {left && <g fill="#725d42" stroke="#3e4d3e" strokeWidth="2"><path d="M60 80V330H75V80M345 80V330H360V80"/><path d="M30 88Q200 55 385 88L355 66Q210 30 70 60Z" fill="#41574c"/><path d="M72 103H347" strokeWidth="9"/></g>}
 {[1, 6, 7, 11].includes(chapter) && [220, 540, 860].map((x, i) => <g key={x} className="environment-lantern" style={{ animationDelay: `${i * .4}s` }}><path d={`M${x} 0V62`} stroke="#755d40" strokeWidth="3"/><rect x={x - 18} y="62" width="36" height="44" rx="12" fill="#c9894e" stroke="#684e37" strokeWidth="3"/><path d={`M${x - 12} 73H${x + 12}M${x - 12} 94H${x + 12}M${x} 105V122`} stroke="#efd4a1"/></g>)}
 {chapter === 2 && [200, 530, 860].map(x => <g key={x}><rect x={x - 58} y="220" width="116" height="65" fill={`url(#planks-${chapter})`} stroke="#5d654d" strokeWidth="5"/><path d={`M${x - 65} 209H${x + 65}M${x} 169V240`} stroke="#705f42" strokeWidth="9"/><circle cx={x} cy="200" r="27" stroke="#ebe1bd" strokeWidth="5" fill="none"/></g>)}
 {chapter === 3 && <g><path d="M370 315L610 290M450 290L680 318" stroke="#5b4f39" strokeWidth="15"/><path className="fire-tongue" d="M450 303Q410 258 490 210Q480 265 520 248Q600 208 580 280Q620 300 550 310Z" fill="#c9904e"/><path d="M790 310V128H850V310" fill="#52624e"/><path d="M740 305H900" stroke="#785d43" strokeWidth="9"/></g>}
 {chapter === 4 && [170, 430, 690].map(x => <g key={x} stroke="#756244" strokeWidth="8"><path d={`M${x} 130V310M${x + 150} 130V310M${x} 130H${x + 150}M${x} 215H${x + 150}M${x} 295H${x + 150}`}/>{[20, 45, 73, 99, 124].map(dx => <path key={dx} d={`M${x + dx} 211V156`} stroke="#566e55" strokeWidth="15"/>)}</g>)}
 {chapter === 5 && [200, 560, 900].map(x => <g key={x}><path d={`M${x - 120} 160L${x - 90} 113H${x + 90}L${x + 120} 160Z`} fill="#cbb67e" stroke="#806344" strokeWidth="3"/><path d={`M${x - 90} 160V307M${x + 90} 160V307M${x - 100} 280H${x + 100}`} stroke="#836646" strokeWidth="9"/></g>)}
 {chapter === 8 && <g><path d="M0 205Q570 390 1200 212" stroke="#b7dbd4" strokeWidth="54" fill="none"/><path d="M350 310Q610 218 850 310" stroke="#6d7059" strokeWidth="25" fill="none"/><path d="M355 305Q610 213 845 305" stroke="#d9c69d" strokeWidth="17" fill="none"/>{[200, 960].map(x => <g key={x}><path d={`M${x - 80} 285H${x + 80}V245H${x - 80}Z`} fill="#b29366" stroke="#574e37" strokeWidth="4"/><circle cx={x - 55} cy="296" r="19" fill="#55604b"/><circle cx={x + 55} cy="296" r="19" fill="#55604b"/></g>)}</g>}
 {chapter === 9 && [40, 95, 165, 850, 930, 1050, 1130].map((x, i) => <g key={x} stroke="#395e46" fill="#5a7654"><path d={`M${x} 340L${x + 10} 20M${x - 8} 240H${x + 15}M${x - 6} 150H${x + 19}M${x - 2} 75H${x + 20}`} strokeWidth="5"/><path d={`M${x + 9} ${100 + i % 3 * 30}q-60-45-60-15q30 25 60 15q45-60 65-48q-10 30-65 48`}/></g>)}
 {[10, 11].includes(chapter) && <g><path d="M300 280H880L850 300H325Z" fill="#ad8a57" stroke="#665338" strokeWidth="4"/><path d="M350 300V348M815 300V348" stroke="#594c37" strokeWidth="14"/><path d="M440 270L470 180H725L760 270Z" fill="#ede0bb" stroke="#9a8055" strokeWidth="3"/></g>}
 {chapter === 12 && <g><path d="M840 330L865 155H1040L1070 330Z" fill="#5c6655" stroke="#374f40" strokeWidth="5"/><path d="M885 150V103H1023V150" fill="#5c6655"/><path d="M900 325V270Q951 210 1007 270V325" fill="#ad6d3d"/><path className="fire-tongue" d="M915 324Q913 302 936 280L950 308L976 263Q996 301 989 324" fill="#f0cb75"/></g>}
 </svg>;
}
export function QingyanPortrait() { return <PlacedCharacter id="qingyan" pose="inspecting"/>; }
