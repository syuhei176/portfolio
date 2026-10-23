import type { Route } from "./+types/home";
import { Hero } from "../components/Hero";
import { ProjectCard } from "../components/ProjectCard";

const SITE_URL = "https://www.syuhei176.com/";
const TITLE =
  "部谷 修平 (Shuhei Hiya / syuhei176) - Blockchain Engineer & Creative Coder";
const DESCRIPTION =
  "部谷 修平（Shuhei Hiya / syuhei176）のウェブサイト。ブロックチェーンエンジニア、クリエイティブコーダー。経歴、ゲームやWebGLの作品、論文・記事・スライド。";

export function meta({}: Route.MetaArgs) {
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { tagName: "link", rel: "canonical", href: SITE_URL },
    { property: "og:type", content: "profile" },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:url", content: SITE_URL },
    { property: "og:image", content: `${SITE_URL}img/p1.jpg` },
    { property: "og:locale", content: "ja_JP" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@syuhei176" },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "部谷 修平",
        alternateName: ["Shuhei Hiya", "Syuhei Hiya", "syuhei176"],
        url: SITE_URL,
        image: `${SITE_URL}img/p1.jpg`,
        sameAs: [
          "https://github.com/syuhei176",
          "https://x.com/syuhei176",
          "https://medium.com/@syuhei_hiya",
          "https://hackmd.io/@syuhei",
          "https://syuhei176.github.io/",
        ],
      },
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

const archive = [
  { title: "WebGL Voxel Demo", link: "/world/webgl" },
  { title: "FLOWer", link: "https://flower-lang.github.io/" },
  { title: "Reversi", link: "https://syuhei176.github.io/reversi-game/" },
];

const videos = [
  { title: "What is clooca?", link: "https://www.youtube.com/watch?v=VS5VNB0YA_o" },
  {
    title: "clooca promotion video at Models2013",
    link: "https://www.youtube.com/watch?v=lb5VPcj8rMM",
  },
  { title: "WebGL Demo", link: "https://www.youtube.com/watch?v=qkFQm99UebQ" },
  {
    title: "ETロボコンのためのDomain Specific Modeling Language",
    link: "https://www.youtube.com/watch?v=3QxcZxj-GCU",
  },
];

const writings: { title: string; link?: string; note?: string }[] = [
  {
    title: "Uniswap v4をざっと見たメモ",
    link: "https://medium.com/@syuhei_hiya/uniswap-v4%E3%82%92%E3%81%96%E3%81%A3%E3%81%A8%E8%A6%8B%E3%81%9F-5c7084893556",
  },
  {
    title:
      "Square-Root Perpetuals from Concentrated Liquidity: Range Rolling, Out-of-Range Residuals, and Funding",
    link: "/papers/sqrt-perp.pdf",
    note: "Draft, 2026",
  },
  {
    title: "clooca : Web based tool for Domain Specific Modeling",
    link: "https://ceur-ws.org/Vol-1115/demo6.pdf",
    note: "ACM/IEEE 16th Int. Conf. on Model Driven Engineering Languages and Systems（MODELS 2013）",
  },
  {
    title: "What is clooca?",
    link: "https://www.slideshare.net/syuheihiya/what-is-clooca",
  },
  { title: "Android携帯端末アプリケーション向け消費電力プロファイリング手法" },
];

function SectionHeading({
  en,
  ja,
  color,
}: {
  en: string;
  ja: string;
  color: string;
}) {
  return (
    <div className="text-center mb-12">
      <h2 className={`pixel-text text-2xl md:text-4xl mb-4 glow-text ${color}`}>
        {en}
      </h2>
      <p className="jp-text text-lg md:text-xl text-gray-400">{ja}</p>
    </div>
  );
}

function LinkList({
  items,
  marker,
}: {
  items: { title: string; link?: string; note?: string }[];
  marker: string;
}) {
  return (
    <ul className="jp-text text-lg md:text-xl space-y-4">
      {items.map((item) => (
        <li key={item.title} className="flex gap-3">
          <span className={marker}>{">"}</span>
          <div>
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 underline decoration-dotted underline-offset-4 hover:text-cyan-400 transition-colors"
              >
                {item.title}
              </a>
            ) : (
              <span className="text-gray-200">{item.title}</span>
            )}
            {item.note && (
              <p className="text-sm md:text-base text-gray-500 mt-1">
                {item.note}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />

      <section id="profile" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-5xl relative z-10">
          <SectionHeading en="PROFILE" ja="プロフィール" color="text-yellow-400" />

          <div className="crt-screen border-4 border-yellow-500 shadow-xl shadow-yellow-500/30 p-6 md:p-10">
            <div className="relative z-10 space-y-10 jp-text text-lg md:text-xl leading-relaxed text-gray-200">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src="/img/p1.jpg"
                  alt="部谷 修平"
                  width={240}
                  height={240}
                  className="w-48 h-48 md:w-60 md:h-60 shrink-0 border-4 border-purple-500 object-cover [image-rendering:auto]"
                />
                <p>
                  1988年生まれ。2007年にラ・サール学園高等学校を卒業。九州大学大学院システム情報科学府中退。IPA未踏ユース2010年度スーパークリエータ、国際学会でDomain
                  Specific
                  Modelingの論文発表。学生時代に開発したcloocaは、大学の授業や研究などで利用されました。2012年、株式会社Technical
                  Rockstars設立。ビジュアルプログラミング言語の
                  <a
                    href="https://flower-lang.github.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline underline-offset-4"
                  >
                    FLOWer
                  </a>
                  や、IoT向けバックエンドサービスのMilkcocoaの開発を行っていましたが、その後事業譲渡しました。
                </p>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <img
                  src="/img/p2.jpg"
                  alt="部谷 修平"
                  width={240}
                  height={240}
                  loading="lazy"
                  className="w-48 h-48 md:w-60 md:h-60 shrink-0 border-4 border-cyan-500 object-cover [image-rendering:auto]"
                />
                <p>
                  2018年以降は、Cryptoeconomics Labという会社で、Ethereum
                  Foundationからグラントをいただき、CTOとしてLayer2技術の研究開発をしていました。2021年からは、Ethereum上で動くオラクルに依存しないデリバティブプロトコルである
                  <a
                    href="https://github.com/predyprotocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline underline-offset-4"
                  >
                    Predy Protocol
                  </a>
                  を開発しています。
                </p>
              </div>

              <p className="mono-text text-xl text-right">
                <a
                  href="https://syuhei176.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  {">"} English profile
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

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

      <section id="archive" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading en="ARCHIVE" ja="昔つくったもの" color="text-green-400" />
          <div className="crt-screen border-4 border-green-500 p-6 md:p-10">
            <div className="relative z-10">
              <LinkList items={archive} marker="text-green-400" />
            </div>
          </div>
        </div>
      </section>

      <section id="videos" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading en="VIDEOS" ja="動画" color="text-pink-400" />
          <div className="crt-screen border-4 border-pink-500 p-6 md:p-10">
            <div className="relative z-10 space-y-8">
              <iframe
                className="w-full aspect-video border-2 border-pink-500"
                src="https://www.youtube-nocookie.com/embed/VDGJ2ep5grY"
                title="YouTube video player"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              <LinkList items={videos} marker="text-pink-400" />
            </div>
          </div>
        </div>
      </section>

      <section id="writings" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading
            en="PAPERS & SLIDES"
            ja="論文・記事・スライド"
            color="text-cyan-400"
          />
          <div className="crt-screen border-4 border-cyan-500 p-6 md:p-10">
            <div className="relative z-10">
              <LinkList items={writings} marker="text-cyan-400" />
            </div>
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
