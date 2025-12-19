interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  link: string;
  colorScheme: 'purple' | 'cyan' | 'pink' | 'green';
}

const colorClasses = {
  purple: {
    border: 'border-purple-500',
    bg: 'bg-purple-500',
    shadow: 'shadow-purple-500/50',
    text: 'text-purple-400',
    glow: 'hover:shadow-purple-500/80',
  },
  cyan: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500',
    shadow: 'shadow-cyan-500/50',
    text: 'text-cyan-400',
    glow: 'hover:shadow-cyan-500/80',
  },
  pink: {
    border: 'border-pink-500',
    bg: 'bg-pink-500',
    shadow: 'shadow-pink-500/50',
    text: 'text-pink-400',
    glow: 'hover:shadow-pink-500/80',
  },
  green: {
    border: 'border-green-500',
    bg: 'bg-green-500',
    shadow: 'shadow-green-500/50',
    text: 'text-green-400',
    glow: 'hover:shadow-green-500/80',
  },
};

export function ProjectCard({ title, description, technologies, link, colorScheme }: ProjectCardProps) {
  const colors = colorClasses[colorScheme];

  return (
    <div className={`crt-screen border-4 ${colors.border} shadow-xl ${colors.shadow} transition-all duration-300 ${colors.glow} group hover:-translate-y-2`}>
      <div className="relative">
        <div className={`${colors.bg} p-4`}>
          <div className="flex items-center justify-between">
            <div className="pixel-text text-xs md:text-sm text-white">
              {title}
            </div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="p-6 md:p-8 relative z-10">
          <div className="mb-6">
            <div className={`w-full h-32 md:h-40 bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${colors.border} flex items-center justify-center mb-4 relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${colors.bg} ${i % 3 === 0 ? 'opacity-50' : 'opacity-0'}`}
                      style={{
                        animationDelay: `${i * 0.05}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className={`pixel-text text-2xl md:text-3xl ${colors.text} relative z-10 opacity-50`}>
                GAME
              </div>
            </div>
          </div>

          {description && (
            <p className="mono-text text-lg md:text-xl text-gray-300 mb-6">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {technologies.map((tech) => (
              <div
                key={tech}
                className={`pixel-text text-xs px-3 py-1 bg-gray-800 border-2 ${colors.border} ${colors.text}`}
              >
                {tech}
              </div>
            ))}
          </div>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block pixel-text text-xs md:text-sm px-4 py-2 ${colors.bg} text-white border-2 border-white transition-all duration-200 hover:scale-105`}
          >
            PLAY NOW →
          </a>
        </div>

        <div className={`absolute top-2 right-2 w-8 h-8 border-2 ${colors.border} flex items-center justify-center opacity-50`}>
          <div className={`pixel-text text-xs ${colors.text}`}>1P</div>
        </div>
      </div>
    </div>
  );
}
