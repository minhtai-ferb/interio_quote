import { COLORS } from "@/lib/theme";
import { ImageUploader } from "@/components/image-uploader";

export interface OptionCardData {
  id: string;
  name: string;
  priceFrom: number;
  priceTo: number;
  description: string | null;
  images: { id: string; imageUrl: string }[];
  items: { id: string; name: string; spec: string | null; price: number | null }[];
}

export interface OptionCardActions {
  updateOption: (formData: FormData) => Promise<void>;
  deleteOption: () => Promise<void>;
  addItem: (formData: FormData) => Promise<void>;
  updateItem: (itemId: string, formData: FormData) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addImage: (imageUrl: string, cloudinaryPublicId: string) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
}

export function OptionCard({
  option,
  imageFolder,
  actions,
  badge,
}: {
  option: OptionCardData;
  imageFolder: "templates" | "quotes";
  actions: OptionCardActions;
  badge?: string;
}) {
  return (
    <div style={{ border: `1px solid ${badge ? COLORS.navy : COLORS.border}`, background: "#fff", marginBottom: 18 }}>
      {badge && (
        <div style={{ padding: "8px 18px", background: COLORS.navyTint, color: COLORS.navy, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {badge}
        </div>
      )}
      <div style={{ padding: 18, borderBottom: `1px solid ${COLORS.border}` }}>
        <form action={actions.updateOption} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Tên phương án
              </span>
              <input
                name="name"
                defaultValue={option.name}
                style={{ height: 36, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 14, fontWeight: 600 }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Giá từ (đ)
              </span>
              <input
                type="number" name="priceFrom" defaultValue={option.priceFrom} min={0} step={100000}
                style={{ height: 36, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13, textAlign: "right" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
                Giá đến (đ)
              </span>
              <input
                type="number" name="priceTo" defaultValue={option.priceTo} min={0} step={100000}
                style={{ height: 36, padding: "0 10px", border: `1px solid ${COLORS.border}`, fontSize: 13, textAlign: "right" }}
              />
            </label>
          </div>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600 }}>
              Mô tả
            </span>
            <textarea
              name="description" defaultValue={option.description ?? ""} rows={2}
              style={{ padding: "8px 10px", border: `1px solid ${COLORS.border}`, fontSize: 13, fontFamily: "inherit" }}
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ minHeight: 34, padding: "8px 14px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              Lưu phương án
            </button>
            <button formAction={actions.deleteOption} style={{ minHeight: 34, padding: "8px 14px", background: "#fff", color: "#B42318", border: "1px solid #E4E9EE", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              Xóa phương án
            </button>
          </div>
        </form>
      </div>

      <div style={{ padding: 18, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
          Hình ảnh
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {option.images.map((img) => (
            <div key={img.id} style={{ position: "relative", width: 100, height: 76 }}>
              <div
                style={{
                  width: 100, height: 76, backgroundImage: `url(${img.imageUrl})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }}
              />
              <form action={actions.deleteImage.bind(null, img.id)} style={{ position: "absolute", top: 2, right: 2 }}>
                <button
                  type="submit"
                  style={{ width: 22, height: 22, border: 0, background: "rgba(31,41,51,.75)", color: "#fff", cursor: "pointer", fontSize: 11 }}
                >
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
        <ImageUploader folder={imageFolder} onUploaded={actions.addImage} />
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
          Hạng mục bao gồm
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}` }}>
          {option.items.map((it) => (
            <form
              key={it.id}
              action={actions.updateItem.bind(null, it.id)}
              style={{ display: "grid", gridTemplateColumns: "1.3fr 1.5fr 110px auto", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}
            >
              <input name="name" defaultValue={it.name} style={{ height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
              <input name="spec" defaultValue={it.spec ?? ""} placeholder="Mô tả / vật liệu" style={{ height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5 }} />
              <input type="number" name="price" defaultValue={it.price ?? ""} placeholder="Giá" style={{ height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5, textAlign: "right" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button type="submit" style={{ width: 30, height: 30, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 11 }} title="Lưu">
                  ✓
                </button>
                <button formAction={actions.deleteItem.bind(null, it.id)} style={{ width: 30, height: 30, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 11 }} title="Xóa">
                  ✕
                </button>
              </div>
            </form>
          ))}
        </div>
        <form action={actions.addItem} style={{ display: "grid", gridTemplateColumns: "1.3fr 1.5fr 110px auto", gap: 10, alignItems: "center", marginTop: 10 }}>
          <input name="name" placeholder="Tên hạng mục" required style={{ height: 34, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 13 }} />
          <input name="spec" placeholder="Mô tả / vật liệu" style={{ height: 34, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5 }} />
          <input type="number" name="price" placeholder="Giá" style={{ height: 34, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5, textAlign: "right" }} />
          <button type="submit" style={{ minHeight: 34, padding: "8px 10px", background: COLORS.navyTint, border: `1px solid ${COLORS.navy}`, color: COLORS.navy, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
            + Thêm
          </button>
        </form>
      </div>
    </div>
  );
}
