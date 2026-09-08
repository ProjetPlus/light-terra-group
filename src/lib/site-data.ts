import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CompanyInfo = {
  id: string;
  name: string;
  slogan: string;
  description: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  website: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
};

export type HeroSlide = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  cta_label: string | null;
  cta_url: string | null;
  duration_ms: number;
  position: number;
  is_active: boolean;
};

export type IntroVideo = {
  id: string;
  label: string;
  video_url: string;
  position: number;
  is_active: boolean;
};

export type Activity = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  position: number;
  is_active: boolean;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  location: string | null;
  status: string;
  is_featured: boolean;
  is_published: boolean;
  position: number;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  position: number;
  is_active: boolean;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  message: string;
  rating: number | null;
  status: string;
  is_published: boolean;
  created_at: string;
};

const unwrap = <T,>(result: { data: T | null; error: { message: string } | null }): T => {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as T;
};

export const companyQuery = queryOptions({
  queryKey: ["company_info"],
  queryFn: async (): Promise<CompanyInfo | null> => {
    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as CompanyInfo | null;
  },
  staleTime: 60_000,
});

export const heroSlidesQuery = queryOptions({
  queryKey: ["hero_slides", "public"],
  queryFn: async (): Promise<HeroSlide[]> =>
    unwrap(
      await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true }),
    ),
});

export const introVideosQuery = queryOptions({
  queryKey: ["intro_videos", "public"],
  queryFn: async (): Promise<IntroVideo[]> =>
    unwrap(
      await supabase
        .from("intro_videos")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true }),
    ),
});

export const activitiesQuery = queryOptions({
  queryKey: ["activities", "public"],
  queryFn: async (): Promise<Activity[]> =>
    unwrap(
      await supabase
        .from("activities")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true }),
    ),
});

export const projectsQuery = queryOptions({
  queryKey: ["projects", "public"],
  queryFn: async (): Promise<Project[]> =>
    unwrap(
      await supabase
        .from("projects")
        .select("*")
        .eq("is_published", true)
        .order("position", { ascending: true }),
    ),
});

export const newsListQuery = queryOptions({
  queryKey: ["news", "public"],
  queryFn: async (): Promise<NewsItem[]> =>
    unwrap(
      await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false }),
    ),
});

export const newsItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["news", "public", slug],
    queryFn: async (): Promise<NewsItem | null> => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as NewsItem | null;
    },
  });

export const projectItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["projects", "public", slug],
    queryFn: async (): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Project | null;
    },
  });

export const partnersQuery = queryOptions({
  queryKey: ["partners", "public"],
  queryFn: async (): Promise<Partner[]> =>
    unwrap(
      await supabase
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true }),
    ),
});

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials", "public"],
  queryFn: async (): Promise<Testimonial[]> =>
    unwrap(
      await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true)
        .eq("status", "valide")
        .order("created_at", { ascending: false }),
    ),
});

export function formatDateFr(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type MediaItem = {
  id: string;
  kind: string;
  title: string | null;
  description: string | null;
  url: string;
  poster_url: string | null;
  position: number;
  is_active: boolean;
};

export const mediaItemsQuery = queryOptions({
  queryKey: ["media_items", "public"],
  queryFn: async (): Promise<MediaItem[]> =>
    unwrap(
      await supabase
        .from("media_items")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true }),
    ),
});
