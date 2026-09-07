import Image from "next/image";

type SaciAvatarProps = {
  className?: string;
  alt?: string;
  priority?: boolean;
};

export default function SaciAvatar({
  className = "",
  alt = "SACI, mascota del Área de SAC",
  priority = false,
}: SaciAvatarProps) {
  return (
    <span className={`saci-portrait ${className}`.trim()}>
      <Image
        src="/media/saci-mascota.png"
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 620px) 64px, 96px"
      />
    </span>
  );
}
