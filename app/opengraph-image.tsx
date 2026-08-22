import { ImageResponse } from "next/og";

export const alt = "Fowl to Phoenix — 山雞變鳳凰";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      alignItems: "center",
      background: "#F4F7FB",
      color: "#14213D",
      display: "flex",
      height: "100%",
      justifyContent: "center",
      width: "100%",
    }}>
      <div style={{ display: "flex", flexDirection: "column", width: 920 }}>
        <div style={{ alignItems: "center", display: "flex", gap: 28 }}>
          <div style={{
            alignItems: "center",
            background: "#FFF3CF",
            border: "5px solid #14213D",
            boxShadow: "10px 10px 0 #14213D",
            display: "flex",
            fontSize: 70,
            fontWeight: 800,
            height: 130,
            justifyContent: "center",
            width: 130,
          }}>🔥</div>
          <div style={{ display: "flex", fontSize: 70, fontWeight: 800 }}>Fowl to Phoenix</div>
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05, marginTop: 70 }}>
          Egg. Hatch. Fowl. Phoenix.
        </div>
        <div style={{ color: "#6F56C7", fontSize: 26, marginTop: 30 }}>
          山雞變鳳凰 · Three-pass vocabulary learning
        </div>
      </div>
    </div>,
    size,
  );
}
