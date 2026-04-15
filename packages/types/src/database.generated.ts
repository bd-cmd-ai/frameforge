export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          actor_role: Database["public"]["Enums"]["app_role"] | null;
          actor_user_id: string | null;
          event_name: string;
          happened_at: string;
          id: number;
          metadata: Json;
          provider_id: string | null;
        };
        Insert: {
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          actor_user_id?: string | null;
          event_name: string;
          happened_at?: string;
          id?: number;
          metadata?: Json;
          provider_id?: string | null;
        };
        Update: {
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          actor_user_id?: string | null;
          event_name?: string;
          happened_at?: string;
          id?: number;
          metadata?: Json;
          provider_id?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          icon_key: string;
          id: string;
          is_active: boolean;
          label_i18n: Json;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          icon_key: string;
          id?: string;
          is_active?: boolean;
          label_i18n: Json;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          icon_key?: string;
          id?: string;
          is_active?: boolean;
          label_i18n?: Json;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      claim_requests: {
        Row: {
          created_at: string;
          id: string;
          note: string | null;
          provider_id: string;
          requester_email: string;
          requester_name: string;
          requester_phone: string | null;
          requester_user_id: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["claim_request_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          note?: string | null;
          provider_id: string;
          requester_email: string;
          requester_name: string;
          requester_phone?: string | null;
          requester_user_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["claim_request_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          note?: string | null;
          provider_id?: string;
          requester_email?: string;
          requester_name?: string;
          requester_phone?: string | null;
          requester_user_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["claim_request_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          created_at: string;
          provider_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          provider_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          provider_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      opening_hours: {
        Row: {
          closes_at: string | null;
          created_at: string;
          day_of_week: number;
          id: string;
          is_closed: boolean;
          opens_at: string | null;
          provider_id: string;
          updated_at: string;
        };
        Insert: {
          closes_at?: string | null;
          created_at?: string;
          day_of_week: number;
          id?: string;
          is_closed?: boolean;
          opens_at?: string | null;
          provider_id: string;
          updated_at?: string;
        };
        Update: {
          closes_at?: string | null;
          created_at?: string;
          day_of_week?: number;
          id?: string;
          is_closed?: boolean;
          opens_at?: string | null;
          provider_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_offers: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          body_i18n: Json;
          created_at: string;
          created_by: string | null;
          discount_percent: number | null;
          ends_at: string;
          id: string;
          is_active: boolean;
          is_approved: boolean;
          price_label: string | null;
          provider_id: string;
          starts_at: string;
          title_i18n: Json;
          type: Database["public"]["Enums"]["offer_type"];
          updated_at: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          body_i18n?: Json;
          created_at?: string;
          created_by?: string | null;
          discount_percent?: number | null;
          ends_at: string;
          id?: string;
          is_active?: boolean;
          is_approved?: boolean;
          price_label?: string | null;
          provider_id: string;
          starts_at: string;
          title_i18n: Json;
          type?: Database["public"]["Enums"]["offer_type"];
          updated_at?: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          body_i18n?: Json;
          created_at?: string;
          created_by?: string | null;
          discount_percent?: number | null;
          ends_at?: string;
          id?: string;
          is_active?: boolean;
          is_approved?: boolean;
          price_label?: string | null;
          provider_id?: string;
          starts_at?: string;
          title_i18n?: Json;
          type?: Database["public"]["Enums"]["offer_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          preferred_locale: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          preferred_locale?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          preferred_locale?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      provider_categories: {
        Row: {
          category_id: string;
          created_at: string;
          provider_id: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          provider_id: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          provider_id?: string;
        };
        Relationships: [];
      };
      provider_images: {
        Row: {
          alt_i18n: Json;
          created_at: string;
          id: string;
          is_cover: boolean;
          provider_id: string;
          sort_order: number;
          storage_path: string;
          updated_at: string;
        };
        Insert: {
          alt_i18n?: Json;
          created_at?: string;
          id?: string;
          is_cover?: boolean;
          provider_id: string;
          sort_order?: number;
          storage_path: string;
          updated_at?: string;
        };
        Update: {
          alt_i18n?: Json;
          created_at?: string;
          id?: string;
          is_cover?: boolean;
          provider_id?: string;
          sort_order?: number;
          storage_path?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      providers: {
        Row: {
          address_i18n: Json;
          created_at: string;
          description_i18n: Json;
          email: string | null;
          hero_image_path: string | null;
          id: string;
          is_promoted: boolean;
          is_verified: boolean;
          latitude: number | null;
          location: unknown | null;
          longitude: number | null;
          name_i18n: Json;
          owner_user_id: string | null;
          phone: string | null;
          promoted_until: string | null;
          short_description_i18n: Json;
          slug: string;
          source_place_id: string | null;
          source_type: Database["public"]["Enums"]["provider_source_type"];
          status: Database["public"]["Enums"]["provider_status"];
          timezone: string;
          updated_at: string;
          verified_at: string | null;
          verified_by: string | null;
          website_url: string | null;
        };
        Insert: {
          address_i18n: Json;
          created_at?: string;
          description_i18n?: Json;
          email?: string | null;
          hero_image_path?: string | null;
          id?: string;
          is_promoted?: boolean;
          is_verified?: boolean;
          latitude?: number | null;
          location?: unknown | null;
          longitude?: number | null;
          name_i18n: Json;
          owner_user_id?: string | null;
          phone?: string | null;
          promoted_until?: string | null;
          short_description_i18n?: Json;
          slug: string;
          source_place_id?: string | null;
          source_type?: Database["public"]["Enums"]["provider_source_type"];
          status?: Database["public"]["Enums"]["provider_status"];
          timezone?: string;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          website_url?: string | null;
        };
        Update: {
          address_i18n?: Json;
          created_at?: string;
          description_i18n?: Json;
          email?: string | null;
          hero_image_path?: string | null;
          id?: string;
          is_promoted?: boolean;
          is_verified?: boolean;
          latitude?: number | null;
          location?: unknown | null;
          longitude?: number | null;
          name_i18n?: Json;
          owner_user_id?: string | null;
          phone?: string | null;
          promoted_until?: string | null;
          short_description_i18n?: Json;
          slug?: string;
          source_place_id?: string | null;
          source_type?: Database["public"]["Enums"]["provider_source_type"];
          status?: Database["public"]["Enums"]["provider_status"];
          timezone?: string;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          website_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      provider_public_cards: {
        Row: {
          address_i18n: Json | null;
          badges: string[] | null;
          has_discount: boolean | null;
          has_fresh_today: boolean | null;
          hero_image_path: string | null;
          id: string | null;
          is_open_now: boolean | null;
          is_promoted: boolean | null;
          is_verified: boolean | null;
          latitude: number | null;
          longitude: number | null;
          name_i18n: Json | null;
          short_description_i18n: Json | null;
          slug: string | null;
        };
        Relationships: [];
      };
      provider_public_profiles: {
        Row: {
          address_i18n: Json | null;
          description_i18n: Json | null;
          email: string | null;
          has_discount: boolean | null;
          has_fresh_today: boolean | null;
          hero_image_path: string | null;
          id: string | null;
          is_open_now: boolean | null;
          is_promoted: boolean | null;
          is_verified: boolean | null;
          latitude: number | null;
          longitude: number | null;
          name_i18n: Json | null;
          phone: string | null;
          short_description_i18n: Json | null;
          slug: string | null;
          website_url: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      provider_has_active_offer: {
        Args: {
          offer_kind?: Database["public"]["Enums"]["offer_type"] | null;
          provider_uuid: string;
          reference_ts?: string;
        };
        Returns: boolean;
      };
      provider_is_currently_promoted: {
        Args: {
          provider_uuid: string;
          reference_ts?: string;
        };
        Returns: boolean;
      };
      provider_is_managed_by_current_user: {
        Args: {
          provider_uuid: string;
        };
        Returns: boolean;
      };
      provider_is_open_now: {
        Args: {
          provider_uuid: string;
          reference_ts?: string;
        };
        Returns: boolean;
      };
      provider_is_public: {
        Args: {
          provider_uuid: string;
        };
        Returns: boolean;
      };
      search_providers: {
        Args: {
          category_ids?: string[] | null;
          only_fresh_today?: boolean;
          only_open_now?: boolean;
          only_verified?: boolean;
          radius_meters?: number;
          result_limit?: number;
          search_lat: number;
          search_lng: number;
        };
        Returns: {
          address_i18n: Json;
          badges: string[];
          distance_meters: number;
          has_discount: boolean;
          has_fresh_today: boolean;
          hero_image_path: string | null;
          id: string;
          is_open_now: boolean;
          is_promoted: boolean;
          is_verified: boolean;
          latitude: number;
          longitude: number;
          name_i18n: Json;
          short_description_i18n: Json;
          slug: string;
        }[];
      };
    };
    Enums: {
      app_role: "consumer" | "provider" | "admin";
      claim_request_status: "pending" | "approved" | "rejected";
      offer_type: "fresh_today" | "discount" | "general" | "promoted";
      provider_source_type: "manual" | "google_places" | "claimed_import";
      provider_status: "draft" | "pending_verification" | "active" | "suspended";
    };
    CompositeTypes: Record<string, never>;
  };
}
