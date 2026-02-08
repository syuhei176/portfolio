import type { Route } from "./+types/home";
import { Hero } from "../components/Hero";
import { ProjectCard } from "../components/ProjectCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "syuhei176 - blockchain engineer & creative coder & Game Player" },
    {
      name: "description",
      content:
        "Portfolio of syuhei176 - blockchain engineer & creative coder & Game Player.",
    },
  ];
}

const projects = [
  {
    title: "Lua Game Editor",
    description: "A powerful game editor built with Lua scripting capabilities",
    technologies: ["TypeScript", "Lua"],
    link: "https://sandbox.syuhei176.com/",
    colorScheme: "purple" as const,
  },
  {
    title: "WebGL Voxel",
    description: "3D voxel engine powered by WebGL technology",
    technologies: ["Three.js", "WebGL"],
    link: "https://syuhei176.github.io/webgl-voxel/",
    colorScheme: "cyan" as const,
  },
  {
    title: "MiniGame",
    description: "Collection of mini games showcasing various mechanics",
    technologies: ["JavaScript", "Canvas"],
    link: "https://syuhei176.github.io/game-monorepo/",
    colorScheme: "pink" as const,
  },
  {
    title: "City Simulator",
    description: "Interactive city building and simulation experience",
    technologies: ["JavaScript", "WebGL"],
    link: "https://syuhei176.github.io/city-simulator/",
    colorScheme: "green" as const,
  },
  {
    title: "Ocean Wave",
    description: "Realistic ocean wave simulation with Gerstner waves and SSS",
    technologies: ["Three.js", "GLSL"],
    link: "/wave",
    colorScheme: "cyan" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />

      <section id="projects" className="py-20 px-4 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-pink-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-green-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="pixel-text text-3xl md:text-5xl mb-6 glow-text text-cyan-400">
              GAME LIBRARY
            </h2>
            <div className="mono-text text-xl md:text-2xl text-gray-400">
              <p>SELECT YOUR GAME</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.title}
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t-4 border-purple-500 bg-gradient-to-b from-transparent to-purple-950/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="pixel-text text-xl md:text-2xl text-purple-400 mb-4">
                CONNECT
              </h3>
              <div className="mono-text text-lg md:text-xl space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">{">"}</span>
                  <a
                    href="https://github.com/syuhei176"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-cyan-400 transition-colors"
                  >
                    GitHub: syuhei176
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-400">{">"}</span>
                  <a
                    href="https://x.com/syuhei176"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-pink-400 transition-colors"
                  >
                    Twitter/X: @syuhei176
                  </a>
                </div>
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="pixel-text text-sm text-gray-500 mb-2">
                GAME OVER?
              </div>
              <div className="mono-text text-xl text-gray-400">
                Press F5 to continue
              </div>
              <div className="mt-4 pixel-text text-xs text-purple-400 animate-pulse">
                PLAYER 1
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gray-800">
            <div className="text-center mono-text text-lg text-gray-500">
              <p>2025 syuhei176 - Built with React & Tailwind CSS</p>
              <p className="mt-2 pixel-text text-xs text-cyan-400 opacity-50">
                POWERED BY RETRO VIBES
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
