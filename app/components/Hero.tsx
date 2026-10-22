function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden scanline-effect">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="crt-screen p-8 md:p-16 border-4 border-purple-500 shadow-2xl shadow-purple-500/50">
            <div className="relative z-10">
              <div className="mb-8">
                <div className="inline-block bg-purple-500 text-white px-4 py-2 pixel-text text-xs md:text-sm mb-4 floating">
                  PRESS START
                </div>
              </div>

              <h1 className="mb-8">
                <span className="block pixel-text text-4xl md:text-6xl lg:text-7xl glow-text text-purple-400">
                  <span className="typing">SYUHEI176</span>
                  <span className="cursor-blink">_</span>
                </span>
                <span className="block jp-text text-2xl md:text-4xl mt-6 text-white">
                  部谷 修平{" "}
                  <span className="text-gray-400">/ Shuhei Hiya</span>
                </span>
              </h1>

              <div className="mono-text text-2xl md:text-3xl lg:text-4xl mb-8 text-cyan-400">
                <p className="mb-2">{">"} BLOCKCHAIN ENGINEER</p>
                <p className="mb-2">{">"} CREATIVE CODER</p>
                <p>{">"} GAME PLAYER</p>
              </div>

              <div className="mono-text text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl">
                <p>
                  Building interactive experiences with Lua, TypeScript, WebGL,
                  and Three.js.
                </p>
                <p className="mt-2">
                  Specializing in game engines, voxel graphics, and web-based
                  simulations.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#profile"
                  className="game-button text-xs md:text-sm"
                  onClick={(e) => scrollToSection(e, "profile")}
                >
                  Profile
                </a>
                <a
                  href="#projects"
                  className="game-button text-xs md:text-sm"
                  onClick={(e) => scrollToSection(e, "projects")}
                >
                  View Projects
                </a>
                <a
                  href="https://github.com/syuhei176"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="game-button text-xs md:text-sm bg-gradient-to-b from-cyan-500 to-cyan-700 border-cyan-300 shadow-[0_4px_0_#0e7490,0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_#0e7490,0_4px_0_rgba(0,0,0,0.3)]"
                >
                  GitHub
                </a>
              </div>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "LUA", color: "text-purple-400" },
                  { label: "WEBGL", color: "text-cyan-400" },
                  { label: "THREE.JS", color: "text-pink-400" },
                  { label: "TYPESCRIPT", color: "text-yellow-400" },
                ].map((tech, index) => (
                  <div
                    key={tech.label}
                    className="crt-screen p-4 border-2 border-gray-700"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`pixel-text text-xs ${tech.color} text-center`}
                    >
                      {tech.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="pixel-text text-purple-400 text-xs opacity-50">
          SCROLL DOWN
        </div>
      </div>
    </section>
  );
}
