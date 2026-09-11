import Image from 'next/image';
import type { CSSProperties } from 'react';
import { CharacterArt } from './character-art';
import type { CharacterId } from '@/content/characters';
import type { CharacterPose } from '@/content/characters/assets';
export type CharacterPlacement = {
    groundY: number;
    footOffset: number;
    scale: number;
    shadow: 'soft-ink' | 'lantern' | 'none';
};
export const groundedCharacter: CharacterPlacement = { groundY: 100, footOffset: 8 / 640, scale: 1, shadow: 'soft-ink' };
export function PlacedCharacter({ id, pose = 'standing', placement = groundedCharacter }: {
    id: CharacterId | 'qingyan';
    pose?: CharacterPose;
    placement?: CharacterPlacement;
}) {
    return <span className="placed-character" data-shadow={placement.shadow} style={{ '--ground-y': `${placement.groundY}%`, '--foot-offset': `${placement.footOffset * 100}%`, '--character-scale': placement.scale } as CSSProperties}><>{id === 'qingyan' ? <span className="character-art"><Image src="/characters/qingyan-inspecting.png" alt="持书引路人青砚" width={420} height={640} unoptimized/></span> : <CharacterArt id={id} pose={pose}/>}</><span className="character-contact-shadow" aria-hidden/></span>;
}
