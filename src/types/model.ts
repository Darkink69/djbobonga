export interface Model {
  id: number;
  name: string;
  thumb_image: string;
  vq: string;
  gender: string;
  lang: string;
  social: unknown[];
  viewers: number;
  time_online: [number, number] | number[];
}
