interface Props {
  heightClass?: string;
  dividerClassName?: string;
}

// 1Hora siempre se muestra junto al logo de su distribuidor, RA Cell Technology.
export default function BrandLogos({ heightClass = 'h-9', dividerClassName = 'bg-gray-300' }: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-1hora.png" alt="1Hora" className={`${heightClass} w-auto`} />
      <span className={`w-px self-stretch ${dividerClassName}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-racell.png" alt="RA Cell Technology" className={`${heightClass} w-auto`} />
    </div>
  );
}
