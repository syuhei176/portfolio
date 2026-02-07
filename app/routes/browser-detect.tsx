import { useState, useEffect } from "react";

interface BrowserInfo {
  userAgent: string;
  isLineInAppBrowser: boolean;
  isInAppBrowser: boolean;
  inAppBrowserName: string | null;
  webAuthnSupported: boolean;
  platformAuthenticatorAvailable: boolean | null;
  conditionalMediationAvailable: boolean | null;
  passkeyUsable: boolean | null;
}

function detectBrowser(ua: string): Pick<BrowserInfo, "isLineInAppBrowser" | "isInAppBrowser" | "inAppBrowserName"> {
  // LINE: UA contains "Line/" (e.g., "Line/14.5.0")
  if (/\bLine\//i.test(ua)) {
    return { isLineInAppBrowser: true, isInAppBrowser: true, inAppBrowserName: "LINE" };
  }
  // Facebook
  if (/FBAN|FBAV/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "Facebook" };
  }
  // Instagram
  if (/Instagram/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "Instagram" };
  }
  // Twitter/X
  if (/Twitter/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "Twitter/X" };
  }
  // Threads
  if (/Barcelona/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "Threads" };
  }
  // WeChat
  if (/MicroMessenger/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "WeChat" };
  }
  // Slack
  if (/Slack/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "Slack" };
  }
  // Discord
  if (/Discord/i.test(ua)) {
    return { isLineInAppBrowser: false, isInAppBrowser: true, inAppBrowserName: "Discord" };
  }

  return { isLineInAppBrowser: false, isInAppBrowser: false, inAppBrowserName: null };
}

function StatusBadge({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok === null) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        {label}: checking...
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
        ok ? "bg-green-900/60 text-green-300" : "bg-red-900/60 text-red-300"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
      {label}: {ok ? "Yes" : "No"}
    </span>
  );
}

export default function BrowserDetect() {
  const [info, setInfo] = useState<BrowserInfo | null>(null);

  useEffect(() => {
    async function detect() {
      const ua = navigator.userAgent;
      const browserDetection = detectBrowser(ua);

      const webAuthnSupported =
        typeof window.PublicKeyCredential !== "undefined" &&
        typeof navigator.credentials !== "undefined";

      let platformAuthenticatorAvailable: boolean | null = null;
      let conditionalMediationAvailable: boolean | null = null;

      if (webAuthnSupported) {
        try {
          platformAuthenticatorAvailable =
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch {
          platformAuthenticatorAvailable = false;
        }

        try {
          if (
            typeof PublicKeyCredential.isConditionalMediationAvailable === "function"
          ) {
            conditionalMediationAvailable =
              await PublicKeyCredential.isConditionalMediationAvailable();
          } else {
            conditionalMediationAvailable = false;
          }
        } catch {
          conditionalMediationAvailable = false;
        }
      }

      const passkeyUsable = webAuthnSupported && (platformAuthenticatorAvailable ?? false);

      setInfo({
        userAgent: ua,
        ...browserDetection,
        webAuthnSupported,
        platformAuthenticatorAvailable,
        conditionalMediationAvailable,
        passkeyUsable,
      });
    }

    detect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Browser Detection</h1>
          <p className="text-gray-400">
            In-App Browser & Passkey support detection
          </p>
        </div>

        {!info ? (
          <div className="text-gray-400">Detecting...</div>
        ) : (
          <>
            {/* Summary */}
            <div
              className={`rounded-xl border-2 p-6 ${
                info.isLineInAppBrowser
                  ? "border-green-500 bg-green-950/30"
                  : info.isInAppBrowser
                    ? "border-yellow-500 bg-yellow-950/30"
                    : "border-gray-700 bg-gray-900/50"
              }`}
            >
              <h2 className="text-lg font-semibold mb-3">Browser Type</h2>
              {info.isLineInAppBrowser ? (
                <p className="text-green-300 text-xl font-bold">
                  LINE In-App Browser detected
                </p>
              ) : info.isInAppBrowser ? (
                <p className="text-yellow-300 text-xl font-bold">
                  {info.inAppBrowserName} In-App Browser detected
                </p>
              ) : (
                <p className="text-gray-300 text-xl">
                  Standard browser (not in-app)
                </p>
              )}
            </div>

            {/* Passkey */}
            <div
              className={`rounded-xl border-2 p-6 ${
                info.passkeyUsable
                  ? "border-green-500 bg-green-950/30"
                  : "border-red-500 bg-red-950/30"
              }`}
            >
              <h2 className="text-lg font-semibold mb-4">Passkey Support</h2>
              <div className="text-xl font-bold mb-4">
                {info.passkeyUsable ? (
                  <span className="text-green-300">Passkeys are available</span>
                ) : (
                  <span className="text-red-300">Passkeys are NOT available</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={info.webAuthnSupported} label="WebAuthn API" />
                <StatusBadge ok={info.platformAuthenticatorAvailable} label="Platform Authenticator" />
                <StatusBadge ok={info.conditionalMediationAvailable} label="Conditional UI (Autofill)" />
              </div>
            </div>

            {/* User-Agent */}
            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
              <h2 className="text-lg font-semibold mb-3">User-Agent</h2>
              <code className="block text-sm text-gray-400 break-all leading-relaxed">
                {info.userAgent}
              </code>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
