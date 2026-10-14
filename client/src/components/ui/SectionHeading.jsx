/**
 * SectionHeading — consistent section title block used across all pages.
 * Includes optional eyebrow label, main heading, and subtext.
 */

/**
 * @param {object} props
 * @param {string} [props.eyebrow] — small red-accented label above heading
 * @param {string} props.title — main heading text
 * @param {string} [props.subtitle] — optional paragraph below heading
 * @param {'left'|'center'} [props.align='center']
 * @param {string} [props.className]
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
  light = false,
}) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'
  const titleColor = light ? '!text-white' : 'text-[#0D1B4B]'
  const subtitleColor = light ? '!text-white/70' : 'text-slate-600'

  return (
    <div className={`${alignment} ${className}`}>
      {eyebrow && (
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50/80 border border-blue-200 text-brand-blue mb-3.5 shadow-2xs">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className={`font-heading text-3xl sm:text-4xl font-extrabold ${titleColor} leading-tight tracking-tight`}>
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg ${subtitleColor} max-w-2xl leading-relaxed mx-auto`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
