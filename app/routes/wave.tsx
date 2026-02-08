import { useEffect, useRef, useState } from "react";

export default function Wave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let scene: { start: () => void; destroy: () => void } | null = null;

    async function init() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { OceanScene } = await import("~/lib/wave/scene/OceanScene");
      if (!mounted) return;

      scene = new OceanScene(canvas);
      scene.start();
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
      scene?.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-white">
          Loading...
        </div>
      )}
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
