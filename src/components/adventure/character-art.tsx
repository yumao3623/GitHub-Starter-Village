import Image from "next/image";
import { characters, type CharacterId } from "@/content/characters";
import { resolveCharacterAsset, type CharacterPose } from "@/content/characters/assets";

export function CharacterArt({ id, className = "", decorative = true, pose = "standing" }: { id: CharacterId; className?: string; decorative?: boolean; pose?: CharacterPose }) {
  const character = characters.find(item => item.id === id)!;
  const asset = resolveCharacterAsset(id, pose);
  return <span className={`character-art ${className}`} data-character={id} data-pose={asset.renderedPose} data-pose-fallback={asset.fallback} style={{ aspectRatio: `${asset.crop.width} / ${asset.crop.height}` }} aria-hidden={decorative || undefined}>
    <Image src={asset.path} alt={decorative ? "" : `${character.name}的完整角色设定`} width={asset.atlasWidth} height={asset.atlasHeight} unoptimized draggable={false}
      style={{ width: `${asset.atlasWidth / asset.crop.width * 100}%`, left: `${-asset.crop.x / asset.crop.width * 100}%`, top: `${-asset.crop.y / asset.crop.height * 100}%` }} />
  </span>;
}
