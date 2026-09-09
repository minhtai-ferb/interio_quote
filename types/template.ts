export interface Template {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRoom {
  id: string;
  templateId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateOption {
  id: string;
  templateRoomId: string;
  name: string;
  priceFrom: number;
  priceTo: number;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateOptionImage {
  id: string;
  templateOptionId: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  sortOrder: number;
  createdAt: string;
}

export interface TemplateOptionItem {
  id: string;
  templateOptionId: string;
  name: string;
  spec: string | null;
  price: number | null;
  sortOrder: number;
  createdAt: string;
}

export interface TemplateOptionWithDetails extends TemplateOption {
  images: TemplateOptionImage[];
  items: TemplateOptionItem[];
}

export interface TemplateRoomWithOptions extends TemplateRoom {
  options: TemplateOptionWithDetails[];
}

export interface TemplateWithRooms extends Template {
  rooms: TemplateRoomWithOptions[];
}

export interface TemplateSummary extends Template {
  roomCount: number;
  optionCount: number;
  priceFrom: number;
  priceTo: number;
  quoteCount: number;
  thumbnailUrl: string | null;
}
