import { COLORS } from "@/lib/theme";
import { ImageUploader } from "@/components/image-uploader";
import { ActionForm } from "@/components/action-form";

export interface OptionCardItemVariant {
  id: string;
  name: string;
  spec: string | null;
  price: number;
}

export interface OptionCardItem {
  id: string;
  name: string;
  spec: string | null;
  price: number | null;
  imageUrl: string | null;
  variants: OptionCardItemVariant[];
}

export interface OptionCardData {
  id: string;
  name: string;
  priceFrom: number;
  priceTo: number;
  description: string | null;
  images: { id: string; imageUrl: string }[];
  items: OptionCardItem[];
}

export interface OptionCardActions {
  updateOption: (formData: FormData) => Promise<void>;
  deleteOption: () => Promise<void>;
  addItem: (formData: FormData) => Promise<void>;
  updateItem: (itemId: string, formData: FormData) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  addImage: (imageUrl: string, cloudinaryPublicId: string) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
  setItemImage: (itemId: string, imageUrl: string, cloudinaryPublicId: string) => Promise<void>;
  removeItemImage: (itemId: string) => Promise<void>;
  addItemVariant: (itemId: string, formData: FormData) => Promise<void>;
  updateItemVariant: (variantId: string, formData: FormData) => Promise<void>;
  deleteItemVariant: (variantId: string) => Promise<void>;
}

const fieldStyle: React.CSSProperties = {
  flex: "1 1 140px", minWidth: 0, height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5,
};

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
        <ActionForm
          actions={{
            save: { run: actions.updateOption, message: "Đã lưu phương án" },
            delete: { run: actions.deleteOption, message: "Đã xóa phương án" },
          }}
          style={{ display: "grid", gap: 12 }}
        >
          <div className="iq-grid-stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
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
            <button type="submit" data-intent="save" style={{ minHeight: 34, padding: "8px 14px", background: COLORS.navy, color: "#fff", border: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              Lưu phương án
            </button>
            <button type="submit" data-intent="delete" style={{ minHeight: 34, padding: "8px 14px", background: "#fff", color: "#B42318", border: "1px solid #E4E9EE", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              Xóa phương án
            </button>
          </div>
        </ActionForm>
      </div>

      <div style={{ padding: 18, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
          Hình ảnh (chung cho cả phương án)
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
              <ActionForm
                action={actions.deleteImage.bind(null, img.id)}
                successMessage="Đã xóa hình ảnh"
                style={{ position: "absolute", top: 2, right: 2 }}
              >
                <button
                  type="submit"
                  style={{ width: 22, height: 22, border: 0, background: "rgba(31,41,51,.75)", color: "#fff", cursor: "pointer", fontSize: 11 }}
                >
                  ✕
                </button>
              </ActionForm>
            </div>
          ))}
        </div>
        <ImageUploader folder={imageFolder} onUploaded={actions.addImage} />
      </div>

      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 10 }}>
          Hạng mục bao gồm
        </div>

        {option.items.map((item) => (
          <ItemBlock key={item.id} item={item} imageFolder={imageFolder} actions={actions} />
        ))}

        <ActionForm
          action={actions.addItem}
          successMessage="Đã thêm hạng mục"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}
        >
          <input name="name" placeholder="Tên hạng mục" required style={fieldStyle} />
          <input name="spec" placeholder="Mô tả / vật liệu" style={fieldStyle} />
          <input type="number" name="price" placeholder="Giá" style={{ ...fieldStyle, flex: "0 1 110px", textAlign: "right" }} />
          <button type="submit" style={{ flex: "none", minHeight: 34, padding: "8px 12px", background: COLORS.navyTint, border: `1px solid ${COLORS.navy}`, color: COLORS.navy, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
            + Thêm hạng mục
          </button>
        </ActionForm>
      </div>
    </div>
  );
}

function ItemBlock({
  item,
  imageFolder,
  actions,
}: {
  item: OptionCardItem;
  imageFolder: "templates" | "quotes";
  actions: OptionCardActions;
}) {
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: 14 }}>
        <div style={{ flex: "none" }}>
          {item.imageUrl ? (
            <div style={{ position: "relative", width: 90, height: 90 }}>
              <div style={{ width: 90, height: 90, backgroundImage: `url(${item.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <ActionForm action={actions.removeItemImage.bind(null, item.id)} successMessage="Đã xóa ảnh hạng mục" style={{ position: "absolute", top: 2, right: 2 }}>
                <button type="submit" style={{ width: 20, height: 20, border: 0, background: "rgba(31,41,51,.75)", color: "#fff", cursor: "pointer", fontSize: 10 }}>
                  ✕
                </button>
              </ActionForm>
            </div>
          ) : (
            <div style={{ width: 90 }}>
              <ImageUploader folder={imageFolder} onUploaded={actions.setItemImage.bind(null, item.id)} />
            </div>
          )}
        </div>

        <ActionForm
          actions={{
            save: { run: actions.updateItem.bind(null, item.id), message: "Đã lưu hạng mục" },
            delete: { run: actions.deleteItem.bind(null, item.id), message: "Đã xóa hạng mục" },
          }}
          style={{ flex: "1 1 260px", minWidth: 0, display: "grid", gap: 8 }}
        >
          <input name="name" defaultValue={item.name} placeholder="Tên hạng mục" style={{ height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 13, fontWeight: 600 }} />
          <input name="spec" defaultValue={item.spec ?? ""} placeholder="Mô tả / vật liệu" style={{ height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5 }} />
          <input type="number" name="price" defaultValue={item.price ?? ""} placeholder="Giá cơ bản" style={{ height: 32, padding: "0 8px", border: `1px solid ${COLORS.border}`, fontSize: 12.5, maxWidth: 160, textAlign: "right" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" data-intent="save" style={{ minHeight: 30, padding: "0 12px", border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
              Lưu
            </button>
            <button type="submit" data-intent="delete" style={{ minHeight: 30, padding: "0 12px", border: "1px solid #E4E9EE", background: "#fff", color: "#B42318", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
              Xóa hạng mục
            </button>
          </div>
        </ActionForm>
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: 14, background: COLORS.bg }}>
        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>
          Option phụ (để khách chọn thêm kiểu / vật liệu khác)
        </div>
        {item.variants.map((v) => (
          <ActionForm
            key={v.id}
            actions={{
              save: { run: actions.updateItemVariant.bind(null, v.id), message: "Đã lưu option phụ" },
              delete: { run: actions.deleteItemVariant.bind(null, v.id), message: "Đã xóa option phụ" },
            }}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 6 }}
          >
            <input name="name" defaultValue={v.name} placeholder="Tên option phụ" style={fieldStyle} />
            <input name="spec" defaultValue={v.spec ?? ""} placeholder="Mô tả" style={fieldStyle} />
            <input type="number" name="price" defaultValue={v.price} placeholder="Giá" style={{ ...fieldStyle, flex: "0 1 110px", textAlign: "right" }} />
            <div style={{ display: "flex", gap: 4, flex: "none" }}>
              <button type="submit" data-intent="save" style={{ width: 28, height: 28, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 11 }} title="Lưu">
                ✓
              </button>
              <button type="submit" data-intent="delete" style={{ width: 28, height: 28, border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer", fontSize: 11 }} title="Xóa">
                ✕
              </button>
            </div>
          </ActionForm>
        ))}
        <ActionForm
          action={actions.addItemVariant.bind(null, item.id)}
          successMessage="Đã thêm option phụ"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
        >
          <input name="name" placeholder="Tên option phụ" required style={fieldStyle} />
          <input name="spec" placeholder="Mô tả" style={fieldStyle} />
          <input type="number" name="price" placeholder="Giá" required style={{ ...fieldStyle, flex: "0 1 110px", textAlign: "right" }} />
          <button type="submit" style={{ flex: "none", minHeight: 32, padding: "0 12px", background: COLORS.navyTint, border: `1px solid ${COLORS.navy}`, color: COLORS.navy, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
            + Thêm
          </button>
        </ActionForm>
      </div>
    </div>
  );
}
