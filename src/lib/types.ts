export type Url = {
  id: string;
  url: string;
  type: "homepage" | "shop" | "pdp";
};

export type Competitor = {
  id: string;
  name: string;
  urls: Url[];
};

export type Project = {
  id: string;
  name: string;
  competitors: Competitor[];
};
